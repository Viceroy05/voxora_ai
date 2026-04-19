"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ContactState = {
  fullName: string;
  businessName: string;
  workEmail: string;
  phoneNumber: string;
  industry: string;
  workflow: string;
};

const INITIAL_STATE: ContactState = {
  fullName: "",
  businessName: "",
  workEmail: "",
  phoneNumber: "",
  industry: "",
  workflow: "",
};

export function ContactForm() {
  const [state, setState] = useState<ContactState>(INITIAL_STATE);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof ContactState>(field: K, value: ContactState[K]) {
    setState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      setServerError(null);
      setSuccessMessage(null);

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(state),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          payload?.error?.message ??
          payload?.message ??
          "We could not send your request. Please try again.";
        setServerError(message);
        return;
      }

      setSuccessMessage(payload?.message ?? "Thanks. We will reach out within one business day.");
      setState(INITIAL_STATE);
    });
  }

  return (
    <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm text-white">
          <span>Full name</span>
          <Input
            onChange={(event) => updateField("fullName", event.target.value)}
            placeholder="Alex Morgan"
            required
            value={state.fullName}
          />
        </label>
        <label className="grid gap-2 text-sm text-white">
          <span>Business name</span>
          <Input
            onChange={(event) => updateField("businessName", event.target.value)}
            placeholder="Northside Dental"
            required
            value={state.businessName}
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm text-white">
          <span>Work email</span>
          <Input
            onChange={(event) => updateField("workEmail", event.target.value)}
            placeholder="alex@northside.com"
            required
            type="email"
            value={state.workEmail}
          />
        </label>
        <label className="grid gap-2 text-sm text-white">
          <span>Phone number</span>
          <Input
            onChange={(event) => updateField("phoneNumber", event.target.value)}
            placeholder="+1 (555) 123-4567"
            required
            type="tel"
            value={state.phoneNumber}
          />
        </label>
      </div>
      <label className="grid gap-2 text-sm text-white">
        <span>Industry</span>
        <Input
          onChange={(event) => updateField("industry", event.target.value)}
          placeholder="Clinic, salon, gym, real estate, or service business"
          required
          value={state.industry}
        />
      </label>
      <label className="grid gap-2 text-sm text-white">
        <span>Current workflow</span>
        <Textarea
          onChange={(event) => updateField("workflow", event.target.value)}
          placeholder="Tell us how your team currently handles calls, bookings, and missed leads."
          required
          value={state.workflow}
        />
      </label>

      {serverError ? (
        <p className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-100">
          {serverError}
        </p>
      ) : null}

      {successMessage ? (
        <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-100">
          {successMessage}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button disabled={isPending} size="lg" type="submit">
          {isPending ? "Sending..." : "Book Demo"}
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/pricing">Start Free Trial</Link>
        </Button>
      </div>
    </form>
  );
}
