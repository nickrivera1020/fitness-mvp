"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { completeLesson } from "@/app/module/actions";
import { celebrate } from "@/lib/celebrate";
import { todayLocalISO } from "@/lib/streaks";
import { Markdown } from "@/components/markdown";
import { Flame } from "@/components/wordmark";

export type QuizQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string | null;
};

type Props = {
  moduleId: string;
  title: string;
  body: string;
  caveat: string | null;
  questions: QuizQuestion[];
  alreadyCompleted: boolean;
};

export function LessonView({
  moduleId,
  title,
  body,
  caveat,
  questions,
  alreadyCompleted,
}: Props) {
  const [phase, setPhase] = useState<"reading" | "quiz" | "done">("reading");
  // Freeze the initial value: after saving, the server refreshes this page's
  // props and alreadyCompleted flips to true — but this visit wasn't a review.
  const [wasCompleted] = useState(alreadyCompleted);
  const [qIndex, setQIndex] = useState(0);
  const [gotIt, setGotIt] = useState(false); // current question answered correctly
  const [wrongPicks, setWrongPicks] = useState<number[]>([]);
  const [lastWrong, setLastWrong] = useState<number | null>(null); // drives shake
  const [globalStreak, setGlobalStreak] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const question = questions[qIndex];

  function pick(i: number) {
    if (gotIt) return;
    if (i === question.correctIndex) {
      setGotIt(true);
      setLastWrong(null);
    } else {
      setWrongPicks((w) => (w.includes(i) ? w : [...w, i]));
      setLastWrong(i);
    }
  }

  function finish() {
    setSaveError(null);
    startTransition(async () => {
      const result = await completeLesson(moduleId, todayLocalISO());
      if (result.error) {
        setSaveError(result.error);
        return;
      }
      setGlobalStreak(result.globalStreak);
      setPhase("done");
      celebrate();
    });
  }

  function next() {
    if (qIndex + 1 < questions.length) {
      setQIndex(qIndex + 1);
      setGotIt(false);
      setWrongPicks([]);
      setLastWrong(null);
    } else {
      finish();
    }
  }

  if (phase === "done") {
    return (
      <div className="animate-rise flex flex-col items-center gap-5 py-16 text-center">
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
            {wasCompleted ? "Nice review." : "Lesson complete."}
          </h2>
          {globalStreak !== null && globalStreak > 0 && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-ember-soft px-3 py-1 text-sm font-semibold text-ember-deep">
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
    );
  }

  if (phase === "quiz" && question) {
    return (
      <div className="animate-rise flex flex-col gap-5 pb-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
          Check your understanding · {qIndex + 1} of {questions.length}
        </p>
        <h2 className="text-lg font-semibold leading-snug">{question.prompt}</h2>

        <div className="flex flex-col gap-2.5">
          {question.choices.map((choice, i) => {
            const isCorrectPick = gotIt && i === question.correctIndex;
            const isWrongPick = wrongPicks.includes(i);
            return (
              <button
                key={i}
                onClick={() => pick(i)}
                disabled={gotIt || isWrongPick}
                className={`rounded-xl border px-4 py-3.5 text-left leading-snug transition-all duration-150
                  ${
                    isCorrectPick
                      ? "border-leaf bg-leaf-soft font-medium text-leaf"
                      : isWrongPick
                        ? `border-alert/40 bg-alert-soft text-alert/80 ${lastWrong === i ? "animate-shake" : ""}`
                        : "border-line bg-white active:scale-[0.99] hover:border-ink-soft/40"
                  }`}
              >
                {choice}
              </button>
            );
          })}
        </div>

        {!gotIt && wrongPicks.length > 0 && (
          <p className="text-sm font-medium text-alert">
            Not quite — try another answer.
          </p>
        )}

        {gotIt && (
          <div className="animate-rise flex flex-col gap-4">
            {question.explanation && (
              <div className="rounded-xl bg-leaf-soft px-4 py-3 text-sm leading-relaxed text-ink">
                <span className="font-semibold text-leaf">Correct. </span>
                {question.explanation}
              </div>
            )}
            {saveError && (
              <p className="text-sm font-medium text-alert">{saveError}</p>
            )}
            <button
              onClick={next}
              disabled={isPending}
              className="rounded-xl bg-ember px-4 py-3.5 font-semibold text-white
                         transition-all duration-150 hover:bg-ember-deep
                         active:scale-[0.98] disabled:opacity-60"
            >
              {isPending
                ? "Saving…"
                : qIndex + 1 < questions.length
                  ? "Next question"
                  : "Finish lesson"}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Reading phase
  return (
    <div className="animate-rise flex flex-col gap-2 pb-12">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {alreadyCompleted && (
        <p className="inline-flex items-center gap-1 text-sm font-medium text-leaf">
          ✓ Completed — reviewing
        </p>
      )}
      <div className="text-[15px] text-ink/90">
        <Markdown>{body}</Markdown>
      </div>

      {caveat && (
        <aside className="my-2 rounded-xl border-l-4 border-ember bg-ember-soft px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ember-deep">
            Estimate, not a guarantee
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink/90">{caveat}</p>
        </aside>
      )}

      <div className="mt-4 flex flex-col gap-2">
        {saveError && (
          <p className="text-sm font-medium text-alert">{saveError}</p>
        )}
        {questions.length > 0 ? (
          <button
            onClick={() => setPhase("quiz")}
            className="rounded-xl bg-ember px-4 py-3.5 font-semibold text-white
                       transition-all duration-150 hover:bg-ember-deep active:scale-[0.98]"
          >
            Check your understanding
          </button>
        ) : (
          <button
            onClick={finish}
            disabled={isPending}
            className="rounded-xl bg-ember px-4 py-3.5 font-semibold text-white
                       transition-all duration-150 hover:bg-ember-deep
                       active:scale-[0.98] disabled:opacity-60"
          >
            {isPending ? "Saving…" : "Mark as read"}
          </button>
        )}
      </div>
    </div>
  );
}
