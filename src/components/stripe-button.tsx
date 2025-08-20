"use client";

import { loadStripe } from "@stripe/stripe-js";

import { createCheckoutSessionAction } from "@/actions/create-checkout-session";
import { Button } from "@/components/ui/button";
import { env } from "@/env.mjs";

export const StripeButton = () => {
  const handleCreateCheckoutSession = async () => {
    const { id } = await createCheckoutSessionAction();

    const stripe = await loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    await stripe!.redirectToCheckout({ sessionId: id });
  };

  return (
    <Button onClick={handleCreateCheckoutSession} variant="cosmic" size="lg">
      Upgrade to PRO
    </Button>
  );
};
