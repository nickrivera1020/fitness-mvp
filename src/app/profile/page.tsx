import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import {
  ProfileView,
  type ChallengeSummary,
} from "@/components/profile-view";
import { displayGlobalStreak } from "@/lib/streaks";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: track }, { data: progress }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, current_streak, longest_streak, last_active_date, created_at")
        .eq("id", user!.id)
        .maybeSingle(),
      supabase
        .from("tracks")
        .select("id, title")
        .eq("is_published", true)
        .order("order_index")
        .limit(1)
        .maybeSingle(),
      supabase
        .from("user_progress")
        .select("module_id, status, completed_at")
        .eq("user_id", user!.id),
    ]);

  const progressByModule = new Map(
    (progress ?? []).map((p) => [p.module_id, p])
  );

  let doneCount = 0;
  let totalCount = 0;
  let challenges: ChallengeSummary[] = [];

  if (track) {
    const [{ data: modules }, { data: checkIns }] = await Promise.all([
      supabase
        .from("modules")
        .select("id, type, title, order_index, challenges(target_days)")
        .eq("track_id", track.id)
        .eq("is_published", true)
        .order("order_index"),
      supabase
        .from("challenge_check_ins")
        .select("module_id, check_in_date")
        .eq("user_id", user!.id)
        .order("check_in_date", { ascending: false }),
    ]);

    const datesByModule = new Map<string, string[]>();
    for (const c of checkIns ?? []) {
      const list = datesByModule.get(c.module_id) ?? [];
      list.push(c.check_in_date as string);
      datesByModule.set(c.module_id, list);
    }

    totalCount = (modules ?? []).length;
    doneCount = (modules ?? []).filter(
      (m) => progressByModule.get(m.id)?.status === "completed"
    ).length;

    challenges = (modules ?? [])
      .filter((m) => m.type === "challenge")
      .map((m) => {
        const p = progressByModule.get(m.id);
        const challengeRow = Array.isArray(m.challenges)
          ? m.challenges[0]
          : m.challenges;
        return {
          id: m.id,
          title: m.title,
          targetDays: challengeRow?.target_days ?? 1,
          completed: p?.status === "completed",
          completedAt: p?.completed_at ?? null,
          checkInDates: datesByModule.get(m.id) ?? [],
        };
      });
  }

  const serverToday = new Date().toISOString().slice(0, 10);
  const headerStreak = displayGlobalStreak(
    profile?.current_streak ?? 0,
    profile?.last_active_date ?? null,
    serverToday
  );

  return (
    <>
      <AppHeader streak={headerStreak} />
      <main className="mx-auto w-full max-w-lg px-5 pb-16 pt-8">
        <h1 className="sr-only">Profile</h1>
        <ProfileView
          displayName={profile?.display_name ?? null}
          email={user!.email ?? ""}
          joined={profile?.created_at ?? new Date().toISOString()}
          currentStreak={profile?.current_streak ?? 0}
          longestStreak={profile?.longest_streak ?? 0}
          lastActiveDate={profile?.last_active_date ?? null}
          trackTitle={track?.title ?? null}
          doneCount={doneCount}
          totalCount={totalCount}
          challenges={challenges}
        />
      </main>
    </>
  );
}
