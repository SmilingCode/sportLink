type StripeIdentityError = {
  message?: string;
};

type StripeIdentityResult = {
  error?: StripeIdentityError;
};

type StripeIdentityObject = {
  verifyIdentity: (clientSecret: string) => Promise<StripeIdentityResult>;
};

type StripeClient = StripeIdentityObject;

type StripeConstructor = (publishableKey: string) => StripeClient;

declare global {
  interface Window {
    Stripe?: StripeConstructor;
  }
}

let stripeIdentityPromise: Promise<StripeIdentityObject> | null = null;

function getOrCreateStripeScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Stripe) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://js.stripe.com/v3"]',
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Stripe.js.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Stripe.js."));
    document.head.appendChild(script);
  });
}

export async function getStripeIdentityClient(): Promise<StripeIdentityObject> {
  if (!stripeIdentityPromise) {
    stripeIdentityPromise = (async () => {
      const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!publishableKey) {
        throw new Error("Stripe publishable key is missing.");
      }

      await getOrCreateStripeScript();

      if (!window.Stripe) {
        throw new Error("Stripe.js did not initialize correctly.");
      }

      const stripe = window.Stripe(publishableKey);
      if (typeof stripe.verifyIdentity !== "function") {
        throw new Error("Stripe Identity is unavailable in this browser.");
      }

      return stripe;
    })().catch((error) => {
      stripeIdentityPromise = null;
      throw error;
    });
  }

  return stripeIdentityPromise;
}
