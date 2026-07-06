"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, signup, type AuthState } from "@/app/auth/actions";
import { Wordmark } from "@/components/wordmark";

const initialState: AuthState = { error: null, message: null };

const inputClasses =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-base " +
  "placeholder:text-ink-soft/60 outline-none transition-shadow " +
  "focus:border-ember focus:ring-2 focus:ring-ember/25";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const action = mode === "login" ? login : signup;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <main className="flex flex-1 flex-col px-6 py-10">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8">
        <div className="flex flex-col items-start gap-4">
          <Wordmark size="lg" />
          {mode === "login" ? (
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Welcome back
              </h1>
              <p className="mt-1 text-ink-soft">
                Pick up where you left off.
              </p>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Start small. Stay consistent.
              </h1>
              <p className="mt-1 text-ink-soft">
                Short lessons, real habits. Free account.
              </p>
            </div>
          )}
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          {mode === "signup" && (
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">First name</span>
              <input
                name="name"
                type="text"
                autoComplete="given-name"
                placeholder="Nick"
                className={inputClasses}
              />
            </label>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className={inputClasses}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Password</span>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
              className={inputClasses}
            />
          </label>

          {state.error && (
            <p
              role="alert"
              className="rounded-xl bg-alert-soft px-4 py-3 text-sm text-alert"
            >
              {state.error}
            </p>
          )}
          {state.message && (
            <p className="rounded-xl bg-leaf-soft px-4 py-3 text-sm text-leaf">
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 rounded-xl bg-ember px-4 py-3.5 text-base font-semibold
                       text-white transition-all duration-150 hover:bg-ember-deep
                       active:scale-[0.98] disabled:opacity-60"
          >
            {isPending
              ? "One sec…"
              : mode === "login"
                ? "Log in"
                : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-ink-soft">
          {mode === "login" ? (
            <>
              New here?{" "}
              <Link
                href="/signup"
                className="font-medium text-ember hover:text-ember-deep"
              >
                Create an account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-ember hover:text-ember-deep"
              >
                Log in
              </Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
