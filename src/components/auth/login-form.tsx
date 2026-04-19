"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const CALLBACK_ERRORS: Record<string, string> = {
  auth_callback_failed: "We could not complete the sign-in callback. Please try again.",
  access_denied: "Access was denied by the authentication provider.",
  server_error: "Authentication failed on the server. Please try again.",
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const nextPath = useMemo(() => {
    const requestedNext = searchParams.get("next");
    if (!requestedNext) {
      return "/dashboard";
    }

    return requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/dashboard";
  }, [searchParams]);

  const callbackError = searchParams.get("error");
  const callbackMessage = callbackError
    ? CALLBACK_ERRORS[callbackError] ?? "Authentication failed. Please try again."
    : null;

  function clearMessages() {
    setError(null);
    setNotice(null);
  }

  async function handlePasswordSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      clearMessages();
      const supabase = createBrowserSupabaseClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.replace(nextPath);
      router.refresh();
    });
  }

  async function handleMagicLink() {
    startTransition(async () => {
      clearMessages();
      const supabase = createBrowserSupabaseClient();
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", nextPath);

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: callbackUrl.toString(),
        },
      });

      if (otpError) {
        setError(otpError.message);
        return;
      }

      setNotice("Magic link sent. Check your inbox to finish signing in.");
    });
  }

  return (
    <form className="grid gap-4" onSubmit={handlePasswordSignIn}>
      <label className="grid gap-2 text-sm text-white">
        <span>Work email</span>
        <Input
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@company.com"
          type="email"
          value={email}
        />
      </label>
      <label className="grid gap-2 text-sm text-white">
        <span>Password</span>
        <Input
          autoComplete="current-password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          type="password"
          value={password}
        />
      </label>

      {callbackMessage ? (
        <p className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-100">
          {callbackMessage}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-100">
          {error}
        </p>
      ) : null}

      {notice ? (
        <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-100">
          {notice}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-4 text-sm">
        <Link href="/contact" className="text-primary transition hover:text-primary/80">
          Need access?
        </Link>
        <button
          className="text-muted-foreground transition hover:text-white"
          disabled={isPending || !email}
          onClick={handleMagicLink}
          type="button"
        >
          Email me a magic link
        </button>
      </div>

      <Button className="mt-2" disabled={isPending} size="lg" type="submit">
        Sign in
        <ArrowRight className="size-4" />
      </Button>

      <div className="rounded-[1.5rem] border border-white/8 bg-slate-950/45 px-4 py-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 text-white">
          <Mail className="size-4 text-cyan-300" />
          Magic links use the existing `/auth/callback` route.
        </div>
        <p className="mt-2 leading-7">
          Add your production site URL and `/auth/callback` to Supabase Auth redirect URLs before deploying.
        </p>
      </div>
    </form>
  );
}
