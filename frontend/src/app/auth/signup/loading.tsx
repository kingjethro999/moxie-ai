export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-sm px-6">
        <div className="animate-pulse space-y-8">
          <div className="h-6 w-20 bg-zinc-900 rounded" />
          <div className="space-y-4">
            <div className="h-8 w-40 mx-auto bg-zinc-900 rounded" />
            <div className="h-4 w-32 mx-auto bg-zinc-900 rounded" />
          </div>
          <div className="space-y-4">
            <div className="h-12 bg-zinc-900 rounded-lg" />
            <div className="h-4 bg-zinc-900 rounded" />
            <div className="h-12 bg-zinc-900 rounded-lg" />
            <div className="h-12 bg-zinc-900 rounded-lg" />
            <div className="h-12 bg-zinc-900 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
