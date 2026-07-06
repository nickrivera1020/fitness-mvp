import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";
import { AppHeader } from "@/components/app-header";
import { Flame } from "@/components/wordmark";
import { displayGlobalStreak } from "@/lib/streaks";

const TYPE_LABEL: Record<string, string> = {
  education: "Lesson",
  challenge: "Challenge",
};

function BookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5H6.5A2.5 2.5 0 0 0 4 21V5.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function TrackPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: track }] = await Promise.all([
    supabase
      .from("profiles")
      .select("current_streak, last_active_date")
      .eq("id", user!.id)
      .maybeSingle(),
    supabase
      .from("tracks")
      .select("id, title, description")
      .eq("is_published", true)
      .order("order_index")
      .limit(1)
      .maybeSingle(),
  ]);

  const serverToday = new Date().toISOString().slice(0, 10);
  const globalStreak = displayGlobalStreak(
    profile?.current_streak ?? 0,
    profile?.last_active_date ?? null,
    serverToday
  );

  if (!track) {
    return (
      <>
        <AppHeader streak={globalStreak} />
        <main className="mx-auto w-full max-w-lg px-5 py-10">
          <p className="text-ink-soft">No content published yet — check back soon.</p>
        </main>
      </>
    );
  }

  const [{ data: modules }, { data: progress }] = await Promise.all([
    supabase
      .from("modules")
      .select("id, type, title, summary, order_index")
      .eq("track_id", track.id)
      .eq("is_published", true)
      .order("order_index"),
    supabase
      .from("user_progress")
      .select("module_id, status, current_streak")
      .eq("user_id", user!.id),
  ]);

  const progressByModule = new Map(
    (progress ?? []).map((p) => [p.module_id, p])
  );

  const rows = (modules ?? []).map((m) => ({
    ...m,
    completed: progressByModule.get(m.id)?.status === "completed",
    challengeStreak: progressByModule.get(m.id)?.current_streak ?? 0,
  }));

  // Strictly linear unlocking: a module opens once everything before it is done.
  let blocked = false;
  const list = rows.map((m) => {
    const locked = blocked;
    if (!m.completed) blocked = true;
    return { ...m, locked };
  });

  const doneCount = list.filter((m) => m.completed).length;
  const upNextId = list.find((m) => !m.completed && !m.locked)?.id;
  const allDone = doneCount === list.length && list.length > 0;

  return (
    <>
      <AppHeader streak={globalStreak} />
      <main className="mx-auto w-full max-w-lg px-5 pb-16 pt-8">
        <h1 className="text-2xl font-semibold tracking-tight">{track.title}</h1>
        {track.description && (
          <p className="mt-1 text-ink-soft">{track.description}</p>
        )}

        <div className="mt-5">
          <div className="flex items-center justify-between text-sm font-medium text-ink-soft">
            <span>
              {doneCount} of {list.length} complete
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-ember transition-all duration-500"
              style={{ width: `${(doneCount / Math.max(list.length, 1)) * 100}%` }}
            />
          </div>
        </div>

        {allDone && (
          <div className="mt-6 rounded-2xl border border-leaf/30 bg-leaf-soft p-5 text-center">
            <p className="font-semibold text-leaf">Track complete. 🎉</p>
            <p className="mt-1 text-sm text-ink-soft">
              More tracks are on the way.
            </p>
          </div>
        )}

        <ol className="mt-6 flex flex-col gap-3">
          {list.map((m) => {
            const isUpNext = m.id === upNextId;
            const inner = (
              <div
                className={`flex items-center gap-4 rounded-2xl border bg-white p-4 transition-all duration-150
                  ${
                    m.locked
                      ? "border-line opacity-55"
                      : isUpNext
                        ? "border-ember shadow-[0_1px_10px_-2px_rgba(232,93,31,0.25)] active:scale-[0.99]"
                        : "border-line active:scale-[0.99]"
                  }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full
                    ${
                      m.completed
                        ? "bg-leaf-soft text-leaf"
                        : m.locked
                          ? "bg-paper text-ink-soft/50"
                          : "bg-ember-soft text-ember"
                    }`}
                >
                  {m.completed ? (
                    <CheckIcon className="h-5 w-5" />
                  ) : m.locked ? (
                    <LockIcon className="h-5 w-5" />
                  ) : m.type === "challenge" ? (
                    <Flame className="h-5 w-5" />
                  ) : (
                    <BookIcon className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                      {TYPE_LABEL[m.type] ?? m.type}
                    </p>
                    {isUpNext && (
                      <span className="rounded-full bg-ember px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        Up next
                      </span>
                    )}
                    {!m.completed && m.challengeStreak > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-ember-deep">
                        <Flame className="h-3 w-3" />
                        {m.challengeStreak}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate font-semibold leading-snug">
                    {m.title}
                  </p>
                  {m.summary && (
                    <p className="mt-0.5 truncate text-sm text-ink-soft">
                      {m.summary}
                    </p>
                  )}
                </div>
              </div>
            );

            return (
              <li key={m.id}>
                {m.locked ? (
                  inner
                ) : (
                  <Link href={`/module/${m.id}`} className="block">
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>

        <form action={logout} className="mt-12 text-center">
          <button
            type="submit"
            className="text-sm font-medium text-ink-soft underline-offset-4 hover:underline"
          >
            Sign out
          </button>
        </form>
      </main>
    </>
  );
}
