import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("Stripe-Signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    ) as any;

    if (!session?.metadata?.userId) {
      return new NextResponse("User ID is missing", { status: 400 });
    }

    await adminDb.collection("users").doc(session.metadata.userId).set(
      {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
        isPro: true,
      },
      { merge: true }
    );
  }

  if (event.type === "customer.subscription.deleted") {
    // Subscription was cancelled or expired
    const subscription = session;
    // Find user by stripeCustomerId
    const usersSnapshot = await adminDb
      .collection("users")
      .where("stripeCustomerId", "==", subscription.customer)
      .get();

    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      await userDoc.ref.update({
        isPro: false,
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
      });
    }
  }

  if (event.type === "subscription_schedule.canceled") {
    const schedule = session;
    const usersSnapshot = await adminDb
      .collection("users")
      .where("stripeCustomerId", "==", schedule.customer)
      .get();

    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      await userDoc.ref.update({
        isPro: false,
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
      });
    }
  }

  if (event.type === "payment_intent.succeeded") {
    // Payment succeeded — can be used for logging or notifications
    console.log("Payment intent succeeded:", session.id);
  }

  return new NextResponse(null, { status: 200 });
}
