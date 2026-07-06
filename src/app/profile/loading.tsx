export default function ProfileLoading() {
  return (
    <>
      <div className="border-b border-line px-5 py-3">
        <div className="mx-auto flex w-full max-w-lg items-center justify-between">
          <div className="h-6 w-24 animate-pulse rounded-lg bg-line" />
          <div className="h-6 w-12 animate-pulse rounded-full bg-line" />
        </div>
      </div>
      <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-5 pb-16 pt-8">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-white px-5 py-8">
          <div className="h-16 w-16 animate-pulse rounded-full bg-line" />
          <div className="h-9 w-16 animate-pulse rounded-lg bg-line" />
          <div className="h-4 w-24 animate-pulse rounded bg-line" />
          <div className="h-6 w-28 animate-pulse rounded-full bg-line" />
        </div>
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="rounded-2xl border border-line bg-white p-5">
            <div className="h-3 w-28 animate-pulse rounded bg-line" />
            <div className="mt-3 h-4 w-44 animate-pulse rounded bg-line" />
            <div className="mt-2 h-4 w-56 animate-pulse rounded bg-line" />
          </div>
        ))}
      </main>
    </>
  );
}
