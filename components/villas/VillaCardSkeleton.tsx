// components/villas/VillaCardSkeleton.tsx
export default function VillaCardSkeleton() {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_6px_26px_rgba(15,23,42,0.06)] border border-slate-100 animate-pulse"
      aria-hidden="true"
    >
      <div className="aspect-[4/3] bg-slate-200" />
      <div className="flex flex-col flex-1 p-6">
        <div className="h-4 w-2/3 rounded bg-slate-200" />
        <div className="mt-3 h-3 w-full rounded bg-slate-100" />
        <div className="mt-2 h-3 w-5/6 rounded bg-slate-100" />
        <div className="flex-1" />
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3">
          <div className="h-12 rounded-xl bg-slate-100" />
          <div className="h-12 rounded-xl bg-slate-100" />
          <div className="h-12 rounded-xl bg-slate-100" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="h-10 rounded-xl bg-slate-200" />
          <div className="h-10 rounded-xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
