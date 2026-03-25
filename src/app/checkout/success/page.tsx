export const dynamic = "force-dynamic";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { CheckCircle, Library, ArrowRight } from "lucide-react";
import Stripe from "stripe";
import { db } from "@/db";
import { purchases, prompts } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function CheckoutSuccessPage({
	searchParams,
}: {
	searchParams: Promise<{ session_id?: string }>;
}) {
	const resolvedSearchParams = await searchParams;
	const sessionId = resolvedSearchParams.session_id;

	if (sessionId) {
		const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
			apiVersion: "2026-02-25.clover",
		});

		try {
			const session = await stripe.checkout.sessions.retrieve(sessionId);

			if (session.payment_status === "paid") {
				const promptId = session.metadata?.promptId;
				const buyerId = session.metadata?.buyerId;

				if (promptId && buyerId) {
					const existingPurchase = await db.query.purchases.findFirst(
						{
							where: (p, { and, eq }) =>
								and(
									eq(p.promptId, promptId),
									eq(p.buyerId, buyerId),
								),
						},
					);

					if (!existingPurchase) {
						const purchaseId = crypto.randomUUID();

						await db.insert(purchases).values({
							id: purchaseId,
							buyerId: buyerId,
							promptId: promptId,
							stripePaymentId:
								(session.payment_intent as string) || null,
							amountPaid: session.amount_total
								? (session.amount_total / 100).toString()
								: "0",
						});

						const prompt = await db.query.prompts.findFirst({
							where: eq(prompts.id, promptId),
						});

						if (prompt) {
							await db
								.update(prompts)
								.set({ totalSales: prompt.totalSales + 1 })
								.where(eq(prompts.id, promptId));
						}
					}
				}
			}
		} catch (error) {
			console.error("Error verifying checkout session:", error);
		}
	}

	return (
		<div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
			<Navbar />

			<main className="flex-1 flex items-center justify-center p-4">
				<div className="max-w-md w-full bg-white rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-200/40 p-8 md:p-12 text-center">
					<div className="flex justify-center mb-6">
						<div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
							<CheckCircle className="w-10 h-10 text-green-500" />
						</div>
					</div>

					<h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">
						Payment Successful!
					</h1>

					<p className="text-gray-600 mb-8 leading-relaxed">
						Thank you for your purchase. Your prompt has been
						securely added to your library and is ready to use.
					</p>

					<div className="space-y-4">
						<Link
							href="/dashboard/purchases"
							className="group flex items-center justify-center gap-2 w-full bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
						>
							<Library className="w-5 h-5" />
							Go to My Purchases
						</Link>

						<Link
							href="/explore"
							className="group flex items-center justify-center gap-2 w-full bg-white text-gray-700 px-6 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 border border-gray-200 transition-all active:scale-95"
						>
							Explore More Prompts
							<ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
						</Link>
					</div>
				</div>
			</main>
		</div>
	);
}
