"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  addDaysISO,
  clampClientDate,
  consecutiveRun,
} from "@/lib/streaks";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Bump the app-wide daily streak (any lesson completion or challenge
 * check-in counts). Returns the streak to show the user.
 */
async function touchGlobalStreak(
  supabase: SupabaseClient,
  userId: string,
  today: string
): Promise<number> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("current_streak, longest_streak, last_active_date")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) return 0;
  if (profile.last_active_date === today) return profile.current_streak;

  const next =
    profile.last_active_date === addDaysISO(today, -1)
      ? profile.current_streak + 1
      : 1;

  await supabase
    .from("profiles")
    .update({
      current_streak: next,
      longest_streak: Math.max(next, profile.longest_streak),
      last_active_date: today,
    })
    .eq("id", userId);

  return next;
}

export async function completeLesson(moduleId: string, clientDate: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in.", globalStreak: 0 };

  const today = clampClientDate(clientDate);

  const { error } = await supabase.from("user_progress").upsert(
    {
      user_id: user.id,
      module_id: moduleId,
      status: "completed",
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,module_id" }
  );
  if (error) {
    return { error: "Couldn't save your progress — try again.", globalStreak: 0 };
  }

  const globalStreak = await touchGlobalStreak(supabase, user.id, today);
  revalidatePath("/");
  return { error: null, globalStreak };
}

export async function checkIn(moduleId: string, clientDate: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in." };

  const today = clampClientDate(clientDate);

  const { data: challenge } = await supabase
    .from("challenges")
    .select("target_days")
    .eq("module_id", moduleId)
    .maybeSingle();
  if (!challenge) return { error: "Challenge not found." };

  const { error: insertError } = await supabase
    .from("challenge_check_ins")
    .insert({ user_id: user.id, module_id: moduleId, check_in_date: today });

  // 23505 = unique violation: already checked in today. Not an error —
  // just recompute state so the UI settles correctly.
  const alreadyToday = insertError?.code === "23505";
  if (insertError && !alreadyToday) {
    return { error: "Couldn't save your check-in — try again." };
  }

  const { data: checkIns } = await supabase
    .from("challenge_check_ins")
    .select("check_in_date")
    .eq("user_id", user.id)
    .eq("module_id", moduleId)
    .order("check_in_date", { ascending: false })
    .limit(60);

  const dates = (checkIns ?? []).map((c) => c.check_in_date as string);
  const streak = consecutiveRun(dates, today);
  const completedModule = streak >= challenge.target_days;

  const { error: progressError } = await supabase.from("user_progress").upsert(
    {
      user_id: user.id,
      module_id: moduleId,
      status: completedModule ? "completed" : "in_progress",
      current_streak: streak,
      completed_at: completedModule ? new Date().toISOString() : null,
    },
    { onConflict: "user_id,module_id" }
  );
  if (progressError) {
    return { error: "Couldn't save your progress — try again." };
  }

  const globalStreak = await touchGlobalStreak(supabase, user.id, today);
  revalidatePath("/");

  return {
    error: null,
    streak,
    targetDays: challenge.target_days,
    completedModule,
    alreadyToday,
    globalStreak,
  };
}
