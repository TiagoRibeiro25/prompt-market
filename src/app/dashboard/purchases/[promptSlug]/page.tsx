import { db } from "@/db";
import { prompts, purchases, reviews } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import {
	Copy,
	CheckCircle2,
	LockOpen,
	ArrowLeft,
	Star,
	MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function PurchasesPromptRevealPage({
	params,
}: {
	params: Promise<{ promptSlug: string }>;
}) {
	const { userId } = await auth();

	if (!userId) {
		redirect("/sign-in");
	}

	const { promptSlug } = await params;

	// 1. Fetch the prompt
	const prompt = await db.query.prompts.findFirst({
		where: eq(prompts.slug, promptSlug),
	});

	if (!prompt) {
		notFound();
	}

	// 2. Verify ownership (did they buy it, or are they the creator?)
	const isCreator = prompt.sellerId === userId;

	const purchase = await db.query.purchases.findFirst({
		where: and(
			eq(purchases.promptId, prompt.id),
			eq(purchases.buyerId, userId),
		),
	});

	if (!isCreator && !purchase) {
		// Unauthorized! They haven't bought it. Kick them back to public detail page.
		redirect(`/prompt/${prompt.slug}`);
	}

	// 3. Check if user has already reviewed this prompt
	const existingReview = await db.query.reviews.findFirst({
		where: and(
			eq(reviews.promptId, prompt.id),
			eq(reviews.reviewerId, userId),
		),
	});

	// Server Action: Submit Review
	async function submitReview(formData: FormData) {
		"use server";
		const { userId } = await auth();
		if (!userId) return;

		const rating = Number(formData.get("rating"));
		const comment = formData.get("comment") as string;

		if (rating < 1 || rating > 5) return;

		await db.insert(reviews).values({
			id: crypto.randomUUID(),
			reviewerId: userId,
			promptId: prompt!.id,
			rating,
			comment: comment.trim() || null,
		});

		// Calculate new average rating for the prompt
		const allReviews = await db.query.reviews.findMany({
			where: eq(reviews.promptId, prompt!.id),
		});

		const newAvg =
			allReviews.reduce((sum, r) => sum + r.rating, 0) /
			allReviews.length;

		await db
			.update(prompts)
			.set({ averageRating: newAvg.toFixed(2) })
			.where(eq(prompts.id, prompt!.id));

		revalidatePath(`/dashboard/purchases/${prompt!.slug}`);
		revalidatePath(`/prompt/${prompt!.slug}`);
	}

	return (
		<div className="max-w-4xl w-full mx-auto pb-12">
			<Link
				href="/dashboard/purchases"
				className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors mb-8"
			>
				<ArrowLeft className="w-4 h-4" />
				Back to Purchases
			</Link>

			<div className="bg-white rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-200/40 overflow-hidden">
				{/* Header Banner */}
				<div className="bg-linear-to-r from-indigo-600 to-purple-600 p-8 text-white relative overflow-hidden">
					<div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
					<div className="flex items-center gap-2 text-indigo-100 font-medium mb-3">
						<LockOpen className="w-5 h-5" />
						<span>Unlocked Content</span>
					</div>
					<h1 className="text-3xl font-extrabold tracking-tight">
						{prompt.title}
					</h1>
				</div>

				{/* Content Area */}
				<div className="p-8 md:p-10 space-y-8">
					<div>
						<h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
							Instructions / Description
						</h3>
						<p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
							{prompt.description}
						</p>
					</div>

					<div>
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
								The Secret Prompt
							</h3>
						</div>

						<div className="relative group">
							<div className="bg-gray-900 rounded-2xl p-6 text-gray-100 font-mono text-sm leading-relaxed overflow-x-auto border border-gray-800 shadow-inner">
								<pre className="whitespace-pre-wrap font-mono">
									{prompt.fullPrompt}
								</pre>
							</div>

							{/*
								  Note: In a fully client-side component, we would add a clipboard API copy function here.
								  Since this is a server component, we just render the raw prompt clearly.
								*/}
							<div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
								<div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-white text-xs font-medium cursor-default">
									<Copy className="w-3.5 h-3.5" />
									Highlight to Copy
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Review Section */}
			{!isCreator && (
				<div className="mt-12 bg-white rounded-3xl border border-gray-200/80 shadow-sm p-8">
					<h3 className="text-xl font-bold text-gray-900 mb-2">
						Rate your experience
					</h3>

					{existingReview ? (
						<div className="bg-green-50 border border-green-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center mt-6">
							<CheckCircle2 className="w-8 h-8 text-green-500 mb-3" />
							<h4 className="font-bold text-green-900 text-lg">
								Thanks for your review!
							</h4>
							<div className="flex items-center gap-1 mt-2">
								{[...Array(5)].map((_, i) => (
									<Star
										key={i}
										className={`w-5 h-5 ${
											i < existingReview.rating
												? "text-amber-500 fill-amber-500"
												: "text-gray-300"
										}`}
									/>
								))}
							</div>
							{existingReview.comment && (
								<p className="text-green-800 mt-4 italic">
									&quot;{existingReview.comment}&quot;
								</p>
							)}
						</div>
					) : (
						<>
							<p className="text-gray-500 mb-6">
								Did this prompt help you generate what you
								needed? Leave a review to help other creators!
							</p>
							<form action={submitReview} className="space-y-6">
								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-3">
										Rating (1-5)
									</label>
									<div className="flex items-center gap-4">
										{[1, 2, 3, 4, 5].map((num) => (
											<label
												key={num}
												className="relative cursor-pointer"
											>
												<input
													type="radio"
													name="rating"
													value={num}
													required
													className="peer sr-only"
												/>
												<div className="p-3 rounded-xl border-2 border-gray-200 text-gray-400 peer-checked:border-amber-500 peer-checked:text-amber-500 peer-checked:bg-amber-50 hover:bg-gray-50 transition-all">
													<Star className="w-6 h-6 peer-checked:fill-amber-500" />
												</div>
												<span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-400 peer-checked:text-amber-600">
													{num}
												</span>
											</label>
										))}
									</div>
								</div>

								<div className="pt-6">
									<label
										htmlFor="comment"
										className="block text-sm font-semibold text-gray-700 mb-2"
									>
										Written Review (Optional)
									</label>
									<textarea
										id="comment"
										name="comment"
										rows={3}
										placeholder="What did you generate with this? Was it high quality?"
										className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-y"
									/>
								</div>

								<button
									type="submit"
									className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all active:scale-95 w-full sm:w-auto"
								>
									<MessageSquare className="w-4 h-4" />
									Submit Review
								</button>
							</form>
						</>
					)}
				</div>
			)}
		</div>
	);
}
