"use client";

import { useMemo } from "react";
import { logout } from "@/app/auth/actions";
import { aliveRun, displayGlobalStreak, todayLocalISO } from "@/lib/streaks";
import { Flame } from "@/components/wordmark";

export type ChallengeSummary = {
  id: string;
  title: string;
  targetDays: number;
  completed: boolean;
  completedAt: string | null;
  checkInDates: string[];
};

type Props = {
  displayName: string | null;
  email: string;
  joined: string; // ISO timestamp
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  trackTitle: string | null;
  doneCount: number;
  totalCount: number;
  challenges: ChallengeSummary[];
};

export function ProfileView({
  displayName,
  email,
  joined,
  currentStreak,
  longestStreak,
  lastActiveDate,
  trackTitle,
  doneCount,
  totalCount,
  challenges,
}: Props) {
  // Streaks are day-based, so compute them against the user's local date.
  const today = useMemo(() => todayLocalISO(), []);
  const globalStreak = displayGlobalStreak(currentStreak, lastActiveDate, today);
  const activeToday = lastActiveDate === today;

  const joinedLabel = new Date(joined).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Streak hero */}
      <section className="flex flex-col items-center gap-1 rounded-2xl border border-line bg-white px-5 py-8 text-center">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-full ${
            globalStreak > 0 ? "bg-ember-soft text-ember" : "bg-paper text-ink-soft/40"
          }`}
        >
          <Flame className="h-9 w-9" />
        </div>
        <p className="mt-2 text-4xl font-semibold tracking-tight">
          {globalStreak}
        </p>
        <p className="font-medium text-ink-soft">
          day streak{globalStreak !== 1 ? "" : ""}
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          {globalStreak === 0
            ? "Complete a lesson or check in to light it up."
            : activeToday
              ? "You've shown up today. See you tomorrow."
              : "Do one thing today to keep it alive."}
        </p>
        <p className="mt-3 rounded-full bg-paper px-3 py-1 text-sm font-medium text-ink-soft">
          Longest: {longestStreak} {longestStreak === 1 ? "day" : "days"}
        </p>
      </section>

      {/* Track progress */}
      {trackTitle && (
        <section className="rounded-2xl border border-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Track progress
          </p>
          <div className="mt-2 flex items-center justify-between">
            <p className="font-semibold">{trackTitle}</p>
            <p className="text-sm font-medium text-ink-soft">
              {doneCount}/{totalCount}
            </p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-ember transition-all duration-500"
              style={{
                width: `${(doneCount / Math.max(totalCount, 1)) * 100}%`,
              }}
            />
          </div>
        </section>
      )}

      {/* Challenges */}
      {challenges.length > 0 && (
        <section className="rounded-2xl border border-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Challenges
          </p>
          <ul className="mt-3 flex flex-col divide-y divide-line">
            {challenges.map((c) => {
              const streak = aliveRun(c.checkInDates, today);
              return (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <p className="min-w-0 truncate font-medium">{c.title}</p>
                  {c.completed ? (
                    <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-leaf">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                        <path
                          d="M5 13l4 4L19 7"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Done
                    </span>
                  ) : streak > 0 ? (
                    <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-ember-deep">
                      <Flame className="h-4 w-4" />
                      {streak}/{c.targetDays}
                    </span>
                  ) : (
                    <span className="shrink-0 text-sm font-medium text-ink-soft/60">
                      Not started
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Account */}
      <section className="rounded-2xl border border-line bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Account
        </p>
        <p className="mt-2 font-semibold">{displayName ?? email}</p>
        <p className="text-sm text-ink-soft">{email}</p>
        <p className="mt-1 text-sm text-ink-soft">Member since {joinedLabel}</p>
      </section>

      <form action={logout} className="pb-4 text-center">
        <button
          type="submit"
          className="rounded-xl border border-line bg-white px-6 py-3 font-medium
                     text-ink-soft transition-all duration-150 hover:border-alert/40
                     hover:text-alert active:scale-[0.98]"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
