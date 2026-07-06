// Date + streak math. All dates are plain "YYYY-MM-DD" strings representing
// the USER'S local calendar day (the client supplies them), so streaks roll
// over at the user's midnight, not the server's.

export function todayLocalISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function addDaysISO(date: string, delta: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

/** Consecutive run of dates ending exactly on endDate (0 if endDate absent). */
export function consecutiveRun(dates: string[], endDate: string): number {
  const set = new Set(dates);
  let streak = 0;
  let cursor = endDate;
  while (set.has(cursor)) {
    streak++;
    cursor = addDaysISO(cursor, -1);
  }
  return streak;
}

/**
 * The streak a user can still extend "today": today's run if they've checked
 * in, otherwise yesterday's run (alive, awaiting today), otherwise 0 (broken).
 */
export function aliveRun(dates: string[], today: string): number {
  const todayRun = consecutiveRun(dates, today);
  return todayRun > 0 ? todayRun : consecutiveRun(dates, addDaysISO(today, -1));
}

/**
 * A client-supplied date is trusted only within a day of server time
 * (generous enough for any timezone, tight enough to block silly spoofing).
 */
export function clampClientDate(clientDate: string): string {
  const serverToday = new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clientDate)) return serverToday;
  const diff = Math.abs(
    new Date(`${clientDate}T00:00:00Z`).getTime() -
      new Date(`${serverToday}T00:00:00Z`).getTime()
  );
  return diff <= 36 * 60 * 60 * 1000 ? clientDate : serverToday;
}

/** Global streak as it should be displayed: 0 if it's already broken. */
export function displayGlobalStreak(
  currentStreak: number,
  lastActiveDate: string | null,
  today: string
): number {
  if (!lastActiveDate) return 0;
  if (lastActiveDate === today || lastActiveDate === addDaysISO(today, -1)) {
    return currentStreak;
  }
  return 0;
}
