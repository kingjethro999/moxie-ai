export default function Loading() {
  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar Skeleton */}
      <aside className="w-72 bg-[#0a0a0a] border-r border-white/10 p-4 hidden lg:block">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-5 h-5 bg-zinc-800 rounded animate-pulse" />
          <div className="w-16 h-4 bg-zinc-800 rounded animate-pulse" />
        </div>
        <div className="h-10 bg-zinc-800/50 rounded-lg animate-pulse mb-4" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-10 bg-zinc-800/30 rounded-lg animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 border-b border-white/10 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-zinc-800 rounded animate-pulse" />
            <div className="w-16 h-4 bg-zinc-800 rounded animate-pulse" />
          </div>
          <div className="w-32 h-8 bg-zinc-800 rounded animate-pulse" />
        </header>

        {/* Chat Area */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 bg-zinc-800/50 rounded-xl animate-pulse" />
        </div>

        {/* Input Skeleton */}
        <div className="border-t border-white/10 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-800/50 rounded-xl animate-pulse" />
              <div className="flex-1 h-12 bg-zinc-800/50 rounded-xl animate-pulse" />
              <div className="w-10 h-10 bg-zinc-800/50 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
