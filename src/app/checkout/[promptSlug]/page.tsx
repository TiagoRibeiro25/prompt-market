import { db } from "@/db";
import { prompts, purchases, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Navbar } from "@/components/layout/Navbar";
import { createCheckoutSession } from "../actions";
import {
	Lock,
	ShieldCheck,
	ArrowRight,
	AlertCircle,
	CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default async function CheckoutPage({
	params,
}: {
	params: Promise<{ promptSlug: string }>;
}) {
	const { userId } = await auth();

	if (!userId) {
		redirect("/sign-in");
	}

	const { promptSlug } = await params;

	// Fetch prompt and seller details
	const promptData = await db
		.select({
			prompt: prompts,
			seller: {
				name: users.name,
				storeName: users.storeName,
			},
		})
		.from(prompts)
		.innerJoin(users, eq(prompts.sellerId, users.id))
		.where(and(eq(prompts.slug, promptSlug), eq(prompts.status, "active")))
		.limit(1)
		.then((res) => res[0]);

	if (!promptData) {
		notFound();
	}

	const { prompt, seller } = promptData;

	// Check if user already owns it
	const existingPurchase = await db.query.purchases.findFirst({
		where: and(
			eq(purchases.promptId, prompt.id),
			eq(purchases.buyerId, userId),
		),
	});

	const isOwner = prompt.sellerId === userId;
	const hasPurchased = !!existingPurchase;

	// Inline server action to call the checkout session creator
	const handleCheckout = async () => {
		"use server";
		await createCheckoutSession(prompt.id);
	};

	return (
		<div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
			<Navbar />

			<main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
				<div className="text-center mb-10">
					<h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
						Review Your Order
					</h1>
					<p className="text-gray-500 mt-3 text-lg">
						You&apos;re almost there! Complete your purchase to
						unlock the full prompt.
					</p>
				</div>

				<div className="bg-white rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-200/40 p-6 md:p-10">
					<h2 className="text-xl font-bold text-gray-900 mb-6">
						Order Summary
					</h2>

					<div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-8 border-b border-gray-100">
						<div>
							<div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 mb-3">
								{prompt.category.replace("_", " ")}
							</div>
							<h3 className="text-xl md:text-2xl font-bold text-gray-900 line-clamp-2">
								{prompt.title}
							</h3>
							<p className="text-sm font-medium text-gray-500 mt-2">
								by{" "}
								<span className="text-gray-900">
									{seller.storeName || seller.name}
								</span>
							</p>
						</div>
						<div className="text-right shrink-0">
							<span className="text-3xl font-extrabold text-gray-900 tracking-tight">
								{prompt.isFree ? (
									<span className="text-green-600">Free</span>
								) : (
									`$${prompt.price}`
								)}
							</span>
						</div>
					</div>

					<div className="py-8 space-y-5">
						<div className="flex items-center justify-between text-base">
							<span className="text-gray-600 font-medium">
								Subtotal
							</span>
							<span className="font-bold text-gray-900">
								{prompt.isFree ? "$0.00" : `$${prompt.price}`}
							</span>
						</div>
						<div className="flex items-center justify-between text-base">
							<span className="text-gray-600 font-medium">
								Tax
							</span>
							<span className="font-bold text-gray-900">
								$0.00
							</span>
						</div>
						<div className="flex items-center justify-between text-lg md:text-xl font-bold pt-6 border-t border-gray-100">
							<span className="text-gray-900">Total</span>
							<span className="text-indigo-600">
								{prompt.isFree ? "$0.00" : `$${prompt.price}`}
							</span>
						</div>
					</div>

					<div className="mt-4">
						{hasPurchased ? (
							<div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-3">
								<CheckCircle2 className="w-8 h-8 text-blue-500" />
								<div>
									<h4 className="font-bold text-blue-900">
										You already own this!
									</h4>
									<p className="text-sm text-blue-700 mt-1">
										This prompt is available in your
										library.
									</p>
								</div>
								<Link
									href={`/dashboard/purchases/${prompt.slug}`}
									className="mt-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
								>
									View in Library
								</Link>
							</div>
						) : isOwner ? (
							<div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-3">
								<AlertCircle className="w-8 h-8 text-amber-500" />
								<div>
									<h4 className="font-bold text-amber-900">
										This is your own prompt
									</h4>
									<p className="text-sm text-amber-700 mt-1">
										You cannot purchase a prompt you
										created.
									</p>
								</div>
								<Link
									href={`/dashboard/prompts/${prompt.id}/edit`}
									className="mt-2 bg-amber-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-amber-600 transition-colors"
								>
									Edit Listing
								</Link>
							</div>
						) : (
							<form action={handleCheckout}>
								<button
									type="submit"
									className="group flex items-center justify-center gap-2 w-full bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
								>
									{prompt.isFree
										? "Claim Now"
										: "Proceed to Payment"}
									<ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
								</button>
							</form>
						)}
					</div>

					<div className="mt-8 flex items-center justify-center gap-6 text-sm font-medium text-gray-400">
						<div className="flex items-center gap-1.5">
							<Lock className="w-4 h-4" /> Secure Checkout
						</div>
						<div className="flex items-center gap-1.5">
							<ShieldCheck className="w-4 h-4" /> Buyer Protection
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
