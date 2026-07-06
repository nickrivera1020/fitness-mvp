import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LessonView, type QuizQuestion } from "@/components/lesson-view";
import { ChallengeView } from "@/components/challenge-view";

export default async function ModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: mod } = await supabase
    .from("modules")
    .select("id, track_id, type, title, order_index")
    .eq("id", id)
    .maybeSingle();
  if (!mod) notFound();

  // Enforce linear unlocking on the server too — a shared link to a locked
  // module should bounce back to the track, not skip ahead.
  const [{ data: siblings }, { data: progress }] = await Promise.all([
    supabase
      .from("modules")
      .select("id, order_index")
      .eq("track_id", mod.track_id)
      .eq("is_published", true)
      .lt("order_index", mod.order_index),
    supabase
      .from("user_progress")
      .select("module_id, status")
      .eq("user_id", user!.id),
  ]);

  const completedSet = new Set(
    (progress ?? [])
      .filter((p) => p.status === "completed")
      .map((p) => p.module_id)
  );
  const locked = (siblings ?? []).some((s) => !completedSet.has(s.id));
  if (locked) redirect("/");

  const alreadyCompleted = completedSet.has(mod.id);

  let view: React.ReactNode;

  if (mod.type === "education") {
    const [{ data: content }, { data: questions }] = await Promise.all([
      supabase
        .from("education_content")
        .select("body, caveat")
        .eq("module_id", mod.id)
        .maybeSingle(),
      supabase
        .from("quiz_questions")
        .select("id, prompt, choices, correct_index, explanation")
        .eq("module_id", mod.id)
        .order("order_index"),
    ]);
    if (!content) notFound();

    const quiz: QuizQuestion[] = (questions ?? []).map((q) => ({
      id: q.id,
      prompt: q.prompt,
      choices: q.choices as string[],
      correctIndex: q.correct_index,
      explanation: q.explanation,
    }));

    view = (
      <LessonView
        moduleId={mod.id}
        title={mod.title}
        body={content.body}
        caveat={content.caveat}
        questions={quiz}
        alreadyCompleted={alreadyCompleted}
      />
    );
  } else if (mod.type === "challenge") {
    const [{ data: challenge }, { data: checkIns }] = await Promise.all([
      supabase
        .from("challenges")
        .select("instructions, metric_label, target_days")
        .eq("module_id", mod.id)
        .maybeSingle(),
      supabase
        .from("challenge_check_ins")
        .select("check_in_date")
        .eq("user_id", user!.id)
        .eq("module_id", mod.id)
        .order("check_in_date", { ascending: false })
        .limit(60),
    ]);
    if (!challenge) notFound();

    view = (
      <ChallengeView
        moduleId={mod.id}
        title={mod.title}
        instructions={challenge.instructions}
        metricLabel={challenge.metric_label}
        targetDays={challenge.target_days}
        checkInDates={(checkIns ?? []).map((c) => c.check_in_date as string)}
        alreadyCompleted={alreadyCompleted}
      />
    );
  } else {
    // Tiers 3-5 exist in the schema but have no UI in this build.
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-lg px-5 pb-10">
      <nav className="sticky top-0 z-10 -mx-5 mb-4 border-b border-line bg-paper/90 px-5 py-3 backdrop-blur">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
            <path
              d="M15 5l-7 7 7 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to the track
        </Link>
      </nav>
      {view}
    </main>
  );
}
