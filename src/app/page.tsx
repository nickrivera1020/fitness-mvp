import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";
import { Wordmark } from "@/components/wordmark";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName =
    (user?.user_metadata?.display_name as string | null) ?? null;

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-line px-6 py-4">
        <Wordmark />
        <form action={logout}>
          <button
            type="submit"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft
                       transition-colors hover:bg-ember-soft hover:text-ember-deep"
          >
            Sign out
          </button>
        </form>
      </header>

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          You&apos;re in{displayName ? `, ${displayName}` : ""}.
        </h1>
        <p className="text-ink-soft">
          Signed in as <span className="font-medium text-ink">{user?.email}</span>.
        </p>
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-ember">
            Coming next
          </p>
          <p className="mt-2 text-ink-soft">
            Your first track — <span className="text-ink">Nutrition Basics</span> —
            lands here: lessons, challenges, and your streak.
          </p>
        </div>
      </div>
    </main>
  );
}
