export default function SkeletonCard({ index }: { index: number }) {
  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3.5 overflow-hidden"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <div className="flex items-center gap-2">
        <div className="shimmer h-3 w-3 rounded-full" />
        <div className="shimmer h-3 w-28 rounded-md" />
      </div>
      <div className="space-y-2 pt-0.5">
        <div className="shimmer h-3 rounded-md w-full" />
        <div className="shimmer h-3 rounded-md w-[92%]" />
        <div className="shimmer h-3 rounded-md w-[78%]" />
      </div>
      <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
        <div className="shimmer h-2.5 w-36 rounded-md" />
        <div className="shimmer h-7 w-24 rounded-lg" />
      </div>
    </div>
  );
}
