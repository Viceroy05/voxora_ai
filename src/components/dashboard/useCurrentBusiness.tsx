"use client";

import { useEffect, useState } from "react";

type BusinessBootstrapResponse = {
  user: Record<string, unknown>;
  memberships: Array<{ business: { id: string; name?: string } }>;
};

export function useCurrentBusiness() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadBusiness() {
      try {
        const response = await fetch("/api/auth/bootstrap", { cache: "no-store" });

        if (!response.ok) {
          const body = await response.text();
          throw new Error(body || "Unable to load business context.");
        }

        const payload = (await response.json()) as BusinessBootstrapResponse;
        const membership = payload.memberships?.[0];

        if (!membership?.business?.id) {
          throw new Error("No active business found. Please create or join a workspace.");
        }

        if (!isActive) {
          return;
        }

        setBusinessId(membership.business.id);
        setBusinessName(membership.business.name ?? null);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unable to load business context.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadBusiness();

    return () => {
      isActive = false;
    };
  }, []);

  return {
    businessId,
    businessName,
    loading,
    error,
  };
}
