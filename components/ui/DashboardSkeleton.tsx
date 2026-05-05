// components/ui/DashboardSkeleton.tsx
export default function DashboardSkeleton() {
  return (
    <div className="min-h-dvh p-4 md:p-8 max-w-5xl mx-auto animate-pulse">
      <div className="flex items-start justify-between mb-8">
        <div className="space-y-2">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-9 w-64" />
          <div className="skeleton h-3 w-48" />
        </div>
        <div className="skeleton h-10 w-28 rounded-xl" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {[0, 1].map((i) => (
          <div key={i} className="glass rounded-3xl p-6 flex flex-col items-center gap-4">
            <div className="skeleton w-36 h-36 rounded-full" />
            <div className="skeleton h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-20 rounded-2xl" />
        ))}
      </div>

      <div className="space-y-3 mb-6">
        <div className="skeleton h-4 w-32" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-16 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
