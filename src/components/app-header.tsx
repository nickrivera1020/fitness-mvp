import Link from "next/link";
import { Flame, Wordmark } from "@/components/wordmark";

export function AppHeader({ streak }: { streak: number }) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-lg items-center justify-between px-5 py-3">
        <Link href="/" aria-label="Home">
          <Wordmark />
        </Link>
        <Link
          href="/profile"
          aria-label="Profile and streaks"
          className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold
            transition-transform duration-150 active:scale-95 ${
              streak > 0
                ? "bg-ember-soft text-ember-deep"
                : "bg-white text-ink-soft/70 ring-1 ring-line"
            }`}
        >
          <Flame className="h-4 w-4" />
          {streak}
        </Link>
      </div>
    </header>
  );
}
