export default function TrackLoading() {
  return (
    <>
      <div className="border-b border-line px-5 py-3">
        <div className="mx-auto flex w-full max-w-lg items-center justify-between">
          <div className="h-6 w-24 animate-pulse rounded-lg bg-line" />
          <div className="h-6 w-12 animate-pulse rounded-full bg-line" />
        </div>
      </div>
      <main className="mx-auto w-full max-w-lg px-5 pb-16 pt-8">
        <div className="h-7 w-48 animate-pulse rounded-lg bg-line" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-line" />
        <div className="mt-6 h-2 animate-pulse rounded-full bg-line" />
        <div className="mt-6 flex flex-col gap-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4"
            >
              <div className="h-11 w-11 animate-pulse rounded-full bg-line" />
              <div className="flex-1">
                <div className="h-3 w-16 animate-pulse rounded bg-line" />
                <div className="mt-2 h-4 w-40 animate-pulse rounded bg-line" />
                <div className="mt-2 h-3 w-52 animate-pulse rounded bg-line" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
