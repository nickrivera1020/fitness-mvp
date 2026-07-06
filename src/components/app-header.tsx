import Link from "next/link";
import { Flame, Wordmark } from "@/components/wordmark";

export function AppHeader({ streak }: { streak: number }) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-lg items-center justify-between px-5 py-3">
        <Link href="/" aria-label="Home">
          <Wordmark />
        </Link>
        <div
          className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${
            streak > 0 ? "bg-ember-soft text-ember-deep" : "text-ink-soft/60"
          }`}
          title={
            streak > 0
              ? `${streak}-day streak`
              : "Complete a lesson or check in to start a streak"
          }
        >
          <Flame className="h-4 w-4" />
          {streak}
        </div>
      </div>
    </header>
  );
}
