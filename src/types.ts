export interface GenerateRequest {
  nom_etablissement: string;
  type_etablissement: string;
  avis_client: string;
  ton: string;
  sentiment: Sentiment;
}

export interface ResponseData {
  reponse_1: string;
  reponse_2: string;
  reponse_3: string;
}

export type ToneOption = 'Professionnel' | 'Chaleureux' | 'Dynamique';
export type EstablishmentType = 'Restaurant' | 'Coiffeur' | 'Hôtel' | 'Artisan' | 'Autre';
export type Sentiment = 'positif' | 'negatif';
export type RefineAction = 'translate' | 'shorten' | 'formalize';

export interface BusinessProfile {
  name: string;
  type: EstablishmentType;
}
