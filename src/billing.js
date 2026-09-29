// Stripe Checkout (subscription mode). Only three calls: create a checkout
// session, look it up after redirect, and check a subscription is still live.

import Stripe from "stripe";

let stripe;
function getStripe() {
  stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripe;
}

export function billingEnabled() {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID);
}

export async function createCheckout(baseUrl) {
  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${baseUrl}/?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/?canceled=1`,
  });
  return session.url;
}

export async function subscriptionFromCheckout(sessionId) {
  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  if (session.status !== "complete" || !session.subscription) return null;
  return typeof session.subscription === "string" ? session.subscription : session.subscription.id;
}

const statusCache = new Map(); // subscriptionId -> { active, at }
const CACHE_MS = 60 * 60 * 1000;

export async function subscriptionActive(subscriptionId) {
  const hit = statusCache.get(subscriptionId);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.active;
  const sub = await getStripe().subscriptions.retrieve(subscriptionId);
  const active = ["active", "trialing", "past_due"].includes(sub.status);
  statusCache.set(subscriptionId, { active, at: Date.now() });
  return active;
}
