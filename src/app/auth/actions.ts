"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error: string | null;
  message: string | null;
};

function friendlyError(raw: string): string {
  if (raw.includes("Invalid login credentials")) {
    return "That email and password don't match. Double-check and try again.";
  }
  if (raw.toLowerCase().includes("already registered")) {
    return "An account with that email already exists — try logging in instead.";
  }
  if (raw.includes("Password should be")) {
    return "Please use a password with at least 8 characters.";
  }
  if (raw.toLowerCase().includes("fetch")) {
    return "Couldn't reach the server. Check your connection and try again.";
  }
  return raw;
}

export async function login(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: (formData.get("email") as string).trim(),
    password: formData.get("password") as string,
  });

  if (error) {
    return { error: friendlyError(error.message), message: null };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();

  const name = ((formData.get("name") as string) ?? "").trim();

  const { data, error } = await supabase.auth.signUp({
    email: (formData.get("email") as string).trim(),
    password: formData.get("password") as string,
    options: {
      data: { display_name: name || null },
    },
  });

  if (error) {
    return { error: friendlyError(error.message), message: null };
  }

  // No session means the Supabase project still has email confirmation
  // turned on — the account exists but needs verifying first.
  if (!data.session) {
    return {
      error: null,
      message:
        "Almost there — check your email for a confirmation link, then log in.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
