import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db";
import { purchases, prompts } from "@/db/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: "2026-02-25.clover",
});

export async function POST(req: Request) {
	const body = await req.text();
	const signature = (await headers()).get("Stripe-Signature") as string;

	let event: Stripe.Event;

	try {
		event = stripe.webhooks.constructEvent(
			body,
			signature,
			process.env.STRIPE_WEBHOOK_SECRET!,
		);
	} catch (error: unknown) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		console.error("Stripe webhook verification failed:", errorMessage);
		return new NextResponse(`Webhook Error: ${errorMessage}`, {
			status: 400,
		});
	}

	const session = event.data.object as Stripe.Checkout.Session;

	if (event.type === "checkout.session.completed") {
		const promptId = session.metadata?.promptId;
		const buyerId = session.metadata?.buyerId;

		if (!promptId || !buyerId) {
			console.error("Missing metadata in Stripe session", session.id);
			return new NextResponse("Missing metadata", { status: 400 });
		}

		try {
			// Check if purchase already exists to ensure idempotency
			const existingPurchase = await db.query.purchases.findFirst({
				where: (p, { and, eq }) =>
					and(eq(p.promptId, promptId), eq(p.buyerId, buyerId)),
			});

			if (!existingPurchase) {
				const purchaseId = crypto.randomUUID();

				// Record the purchase
				await db.insert(purchases).values({
					id: purchaseId,
					buyerId: buyerId,
					promptId: promptId,
					stripePaymentId: (session.payment_intent as string) || null,
					amountPaid: session.amount_total
						? (session.amount_total / 100).toString()
						: "0",
				});

				// Update total sales for the prompt
				const prompt = await db.query.prompts.findFirst({
					where: eq(prompts.id, promptId),
				});

				if (prompt) {
					await db
						.update(prompts)
						.set({ totalSales: prompt.totalSales + 1 })
						.where(eq(prompts.id, promptId));
				}

				console.log(
					`Purchase fulfilled for Prompt: ${promptId} by User: ${buyerId}`,
				);
			} else {
				console.log(
					`Purchase already exists for Prompt: ${promptId} by User: ${buyerId}`,
				);
			}
		} catch (error: unknown) {
			console.error("Failed to fulfill purchase:", error);
			return new NextResponse("Internal Server Error", { status: 500 });
		}
	}

	return new NextResponse("Webhook processed successfully", { status: 200 });
}
