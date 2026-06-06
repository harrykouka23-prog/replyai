import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const app  = express();
const PORT = process.env.PORT ?? 3001;

// ── Clients ───────────────────────────────────────────────────────────────────

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' });

// Stripe — initialisé seulement si la clé est configurée
const stripeClient = process.env.STRIPE_SECRET_KEY?.startsWith('sk_')
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  : null;

// Supabase Admin (service role) — vérification JWT + opérations DB
const supabaseAdmin = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

// ── Middlewares ───────────────────────────────────────────────────────────────

app.use(cors({
  origin: [
    'http://localhost:5173',
    /\.vercel\.app$/,
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}));

// Health check pour Railway
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
// Webhook Stripe nécessite le body RAW — avant express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// ── Auth middleware ───────────────────────────────────────────────────────────

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();

  const token = header.slice(7);

  if (!supabaseAdmin) {
    // Mode dégradé sans Supabase (dev rapide) — skip auth
    console.warn('[ReplyAI] Supabase non configuré — auth ignorée');
    return next();
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return next();
    req.supabaseUser = user;
    req.supabaseToken = token;
  } catch (err) {
    console.error('Auth middleware error:', err);
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.supabaseUser) return res.status(401).json({ error: 'Non authentifié.' });
  next();
}

// ── Helper : récupérer le profil depuis Supabase ──────────────────────────────

async function getProfile(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, name, credits, is_pro')
    .eq('id', userId)
    .single();
  if (error) throw new Error('Profil introuvable : ' + error.message);
  return data;
}

async function decrementCredits(userId, currentCredits) {
  await supabaseAdmin
    .from('profiles')
    .update({ credits: currentCredits - 1 })
    .eq('id', userId);
}

// ── Route : GET /api/auth/me ──────────────────────────────────────────────────

app.get('/api/auth/me', authMiddleware, requireAuth, async (req, res) => {
  try {
    const profile = await getProfile(req.supabaseUser.id);
    res.json(profile);
  } catch (err) {
    res.status(404).json({ error: err instanceof Error ? err.message : 'Profil introuvable.' });
  }
});

// ── Stripe Checkout ───────────────────────────────────────────────────────────

const PRICE_MAP = {
  monthly: () => process.env.STRIPE_PRICE_MONTHLY,
  yearly:  () => process.env.STRIPE_PRICE_YEARLY,
  agency:  () => process.env.STRIPE_PRICE_AGENCY,
};

app.post('/api/create-checkout-session', authMiddleware, requireAuth, async (req, res) => {
  if (!stripeClient) {
    return res.status(503).json({ error: 'Stripe non configuré. Ajoutez STRIPE_SECRET_KEY dans .env.' });
  }

  const { plan = 'monthly' } = req.body;
  const getPriceId = PRICE_MAP[plan];
  if (!getPriceId) return res.status(400).json({ error: 'Plan inconnu.' });

  const PRICE_ID = getPriceId();
  if (!PRICE_ID) return res.status(503).json({ error: `STRIPE_PRICE_${plan.toUpperCase()} manquant dans .env.` });

  const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';

  try {
    const session = await stripeClient.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: req.supabaseUser.email,
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      metadata: { userId: req.supabaseUser.id, plan },
      success_url: `${FRONTEND_URL}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${FRONTEND_URL}?payment=cancelled`,
      locale: 'fr',
      custom_text: {
        submit: { message: 'Vous pouvez annuler à tout moment depuis votre espace client.' },
      },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Erreur Stripe.' });
  }
});

// ── Stripe Webhook ────────────────────────────────────────────────────────────

app.post('/api/stripe/webhook', async (req, res) => {
  const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeClient || !WEBHOOK_SECRET) return res.sendStatus(200);

  let event;
  try {
    event = stripeClient.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error('Webhook signature error:', err);
    return res.status(400).send('Webhook Error');
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    if (userId && supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ is_pro: true })
        .eq('id', userId);

      if (error) {
        console.error('Erreur activation Pro dans Supabase:', error);
      } else {
        console.log(`✅ Paiement réussi — is_pro=true activé pour ${userId}`);
      }
    }
  }

  res.sendStatus(200);
});

// ── Generate (streaming SSE) ──────────────────────────────────────────────────

app.post('/api/generate', authMiddleware, requireAuth, async (req, res) => {
  let profile;
  try {
    profile = await getProfile(req.supabaseUser.id);
  } catch {
    return res.status(401).json({ error: 'Profil introuvable.' });
  }

  // Si pas Pro → vérifier les crédits
  if (!profile.is_pro && profile.credits <= 0) {
    return res.status(402).json({ error: 'Crédits épuisés.' });
  }

  const { nom_etablissement, type_etablissement, avis_client, ton, sentiment } = req.body;
  if (!nom_etablissement?.trim() || !avis_client?.trim()) {
    return res.status(400).json({ error: 'Paramètres manquants.' });
  }

  // Décrémenter seulement si pas Pro
  if (!profile.is_pro) {
    await decrementCredits(profile.id, profile.credits);
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  const sentimentInstructions = sentiment === 'negatif'
    ? `L'avis est NÉGATIF. Les réponses doivent : présenter des excuses sincères et empathiques, reconnaître le problème sans minimiser, proposer un contact privé pour résoudre, montrer que le commerce prend les retours au sérieux. Ne jamais être défensif.`
    : `L'avis est POSITIF. Les réponses doivent : remercier chaleureusement, personnaliser en reprenant un détail spécifique, inviter à revenir, rester authentiques.`;

  try {
    const stream = anthropic.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system:
        `Tu es un expert en gestion de réputation pour les commerces français. ` +
        `Génère 3 réponses courtes, naturelles et personnalisées pour répondre à un avis Google. ` +
        `${sentimentInstructions} ` +
        `Format STRICT — commence directement :\n===1===\n[réponse 1]\n===2===\n[réponse 2]\n===3===\n[réponse 3]`,
      messages: [{
        role: 'user',
        content:
          `Commerce : ${nom_etablissement}\nType : ${type_etablissement ?? 'Non précisé'}\n` +
          `Ton : ${ton ?? 'Professionnel'}\nAvis : "${avis_client}"`,
      }],
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        send({ delta: event.delta.text });
      }
    }

    const newCredits = profile.is_pro ? profile.credits : profile.credits - 1;
    send({ done: true, credits: newCredits });
    res.end();
  } catch (err) {
    send({ error: err instanceof Error ? err.message : 'Erreur inconnue' });
    res.end();
  }
});

// ── Refine (streaming SSE) ────────────────────────────────────────────────────

app.post('/api/refine', authMiddleware, requireAuth, async (req, res) => {
  let profile;
  try {
    profile = await getProfile(req.supabaseUser.id);
  } catch {
    return res.status(401).json({ error: 'Profil introuvable.' });
  }

  if (!profile.is_pro && profile.credits <= 0) {
    return res.status(402).json({ error: 'Crédits épuisés.' });
  }

  const { text, action } = req.body;
  if (!text?.trim() || !action) return res.status(400).json({ error: 'Paramètres manquants.' });

  const instructions = {
    translate: 'Traduis ce texte en anglais de manière naturelle et professionnelle. Retourne UNIQUEMENT le texte traduit.',
    shorten:   "Raccourcis ce texte de moitié en conservant l'essentiel. Retourne UNIQUEMENT le texte raccourci.",
    formalize: 'Rends ce texte plus formel et professionnel. Retourne UNIQUEMENT le texte modifié.',
  };

  if (!instructions[action]) return res.status(400).json({ error: 'Action inconnue.' });

  if (!profile.is_pro) {
    await decrementCredits(profile.id, profile.credits);
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    const stream = anthropic.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 512,
      system: instructions[action],
      messages: [{ role: 'user', content: text }],
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        send({ delta: event.delta.text });
      }
    }

    const newCredits = profile.is_pro ? profile.credits : profile.credits - 1;
    send({ done: true, credits: newCredits });
    res.end();
  } catch (err) {
    send({ error: err instanceof Error ? err.message : 'Erreur inconnue' });
    res.end();
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`✅  Serveur ReplyAI → http://localhost:${PORT}`));
