"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { prompts, purchases, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { revalidatePath } from "next/cache";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: "2026-02-25.clover",
});

export async function createCheckoutSession(promptId: string) {
	const { userId } = await auth();

	if (!userId) {
		redirect("/sign-in");
	}

	// 1. Fetch the prompt to ensure it exists and is active
	const prompt = await db.query.prompts.findFirst({
		where: eq(prompts.id, promptId),
	});

	if (!prompt || prompt.status !== "active") {
		throw new Error("Prompt is unavailable for purchase.");
	}

	// 2. Prevent self-purchase
	if (prompt.sellerId === userId) {
		throw new Error("You cannot purchase your own prompt.");
	}

	// 3. Check if user already owns this prompt
	const existingPurchase = await db.query.purchases.findFirst({
		where: (purchases, { and, eq }) =>
			and(
				eq(purchases.promptId, promptId),
				eq(purchases.buyerId, userId),
			),
	});

	if (existingPurchase) {
		redirect(`/dashboard/purchases/${prompt.slug}`);
	}

	// 4. Handle Free Prompts (Skip Stripe)
	if (prompt.isFree || Number(prompt.price) === 0) {
		const purchaseId = crypto.randomUUID();

		await db.insert(purchases).values({
			id: purchaseId,
			buyerId: userId,
			promptId: prompt.id,
			stripePaymentId: null,
			amountPaid: "0",
		});

		// Update total sales count
		await db
			.update(prompts)
			.set({ totalSales: prompt.totalSales + 1 })
			.where(eq(prompts.id, prompt.id));

		revalidatePath("/dashboard/purchases");
		redirect(`/dashboard/purchases/${prompt.slug}`);
	}

	// 5. Fetch Seller's Stripe Account ID
	const seller = await db.query.users.findFirst({
		where: eq(users.id, prompt.sellerId),
	});

	if (!seller) {
		throw new Error("Seller not found.");
	}

	const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

	// 6. Create Stripe Checkout Session
	const sessionPayload: Stripe.Checkout.SessionCreateParams = {
		payment_method_types: ["card"],
		mode: "payment",
		success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${appUrl}/checkout/cancel?slug=${prompt.slug}`,
		customer_email: undefined, // Let Stripe collect it or you can pull from user table
		client_reference_id: userId,
		metadata: {
			promptId: prompt.id,
			buyerId: userId,
		},
		line_items: [
			{
				price_data: {
					currency: "usd",
					product_data: {
						name: prompt.title,
						description: prompt.teaser,
					},
					unit_amount: Math.round(Number(prompt.price) * 100), // convert to cents
				},
				quantity: 1,
			},
		],
	};

	// 7. Route funds to connected account if the seller is onboarded with Stripe
	if (seller.stripeAccountId && seller.stripeOnboarded) {
		// Take a 10% platform fee
		const applicationFeeAmount = Math.round(
			Number(prompt.price) * 100 * 0.1,
		);

		sessionPayload.payment_intent_data = {
			application_fee_amount: applicationFeeAmount,
			transfer_data: {
				destination: seller.stripeAccountId,
			},
		};
	}

	const session = await stripe.checkout.sessions.create(sessionPayload);

	if (!session.url) {
		throw new Error("Failed to create Stripe checkout session.");
	}

	redirect(session.url);
}
