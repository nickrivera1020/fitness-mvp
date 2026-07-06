"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { checkIn } from "@/app/module/actions";
import { celebrate } from "@/lib/celebrate";
import { aliveRun, consecutiveRun, todayLocalISO } from "@/lib/streaks";
import { Markdown } from "@/components/markdown";
import { Flame } from "@/components/wordmark";

type Props = {
  moduleId: string;
  title: string;
  instructions: string;
  metricLabel: string;
  targetDays: number;
  checkInDates: string[]; // newest first
  alreadyCompleted: boolean;
};

export function ChallengeView({
  moduleId,
  title,
  instructions,
  metricLabel,
  targetDays,
  checkInDates,
  alreadyCompleted,
}: Props) {
  // Streak state is derived on the client so "today" is the user's timezone.
  const initial = useMemo(() => {
    const today = todayLocalISO();
    return {
      streak: aliveRun(checkInDates, today),
      checkedToday: consecutiveRun(checkInDates, today) > 0,
      hadHistory: checkInDates.length > 0,
    };
  }, [checkInDates]);

  const [streak, setStreak] = useState(initial.streak);
  const [checkedToday, setCheckedToday] = useState(initial.checkedToday);
  const [completed, setCompleted] = useState(alreadyCompleted);
  const [justCompleted, setJustCompleted] = useState(false);
  const [globalStreak, setGlobalStreak] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [popKey, setPopKey] = useState(0); // re-triggers the pop animation
  const [isPending, startTransition] = useTransition();

  const streakBroken =
    initial.hadHistory && initial.streak === 0 && !completed;

  function handleCheckIn() {
    setError(null);
    startTransition(async () => {
      const result = await checkIn(moduleId, todayLocalISO());
      if (result.error) {
        setError(result.error);
        return;
      }
      setStreak(result.streak!);
      setCheckedToday(true);
      setGlobalStreak(result.globalStreak!);
      setPopKey((k) => k + 1);
      if (result.completedModule && !completed) {
        setCompleted(true);
        setJustCompleted(true);
        celebrate();
      }
    });
  }

  const dayPills = (
    <div className="flex items-center gap-2" aria-label={`Day ${streak} of ${targetDays}`}>
      {Array.from({ length: targetDays }, (_, i) => {
        const filled = i < streak;
        const isNewest = i === streak - 1;
        return (
          <div
            key={`${i}-${filled ? popKey : "empty"}`}
            className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold
              ${
                filled
                  ? `border-ember bg-ember text-white ${isNewest && popKey > 0 ? "animate-pop" : ""}`
                  : "border-line bg-white text-ink-soft/60"
              }`}
          >
            {filled ? (
              <Flame className="h-5 w-5" />
            ) : (
              i + 1
            )}
          </div>
        );
      })}
      {targetDays > 1 && (
        <span className="ml-1 text-sm font-medium text-ink-soft">
          day {Math.min(streak + (checkedToday ? 0 : 1), targetDays)} of {targetDays}
        </span>
      )}
    </div>
  );

  if (completed) {
    return (
      <div className="animate-rise flex flex-col gap-6 pb-12">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-white px-5 py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-leaf-soft">
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-leaf" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Challenge complete.
            </h2>
            <p className="mt-1 text-ink-soft">
              {targetDays === 1
                ? "Done is done. That's how habits start."
                : `${targetDays} days in a row. That's a real habit forming.`}
            </p>
            {justCompleted && globalStreak !== null && globalStreak > 0 && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-ember-soft px-3 py-1 text-sm font-semibold text-ember-deep">
                <Flame className="h-4 w-4" />
                {globalStreak}-day streak
              </p>
            )}
          </div>
          <Link
            href="/"
            className="rounded-xl bg-ember px-6 py-3 font-semibold text-white
                       transition-all duration-150 hover:bg-ember-deep active:scale-[0.98]"
          >
            Back to the track
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-rise flex flex-col gap-5 pb-12">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-ember">
          Challenge
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
      </div>

      <div className="text-[15px] text-ink/90">
        <Markdown>{instructions}</Markdown>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5">
        {dayPills}

        {streakBroken && (
          <p className="text-sm leading-relaxed text-ink-soft">
            Your streak reset — that&apos;s part of the process. Today is day
            one again.
          </p>
        )}

        {error && <p className="text-sm font-medium text-alert">{error}</p>}

        {checkedToday ? (
          <div className="flex flex-col gap-1 rounded-xl bg-leaf-soft px-4 py-3.5 text-center">
            <p className="font-semibold text-leaf">✓ Checked in today</p>
            {targetDays > 1 && (
              <p className="text-sm text-ink-soft">
                Come back tomorrow to keep the streak alive.
              </p>
            )}
          </div>
        ) : (
          <button
            onClick={handleCheckIn}
            disabled={isPending}
            className="rounded-xl bg-ember px-4 py-4 text-base font-semibold text-white
                       transition-all duration-150 hover:bg-ember-deep
                       active:scale-[0.98] disabled:opacity-60"
          >
            {isPending ? "Saving…" : metricLabel}
          </button>
        )}
      </div>
    </div>
  );
}
