/* eslint-disable @next/next/no-img-element */
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { prompts, reviews, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Star, MessageSquare } from "lucide-react";
import Link from "next/link";

export default async function DashboardReviewsPage() {
	const { userId } = await auth();

	if (!userId) {
		redirect("/sign-in");
	}

	// Fetch all reviews left on the user's prompts
	const userReviews = await db
		.select({
			id: reviews.id,
			rating: reviews.rating,
			comment: reviews.comment,
			createdAt: reviews.createdAt,
			reviewer: {
				name: users.name,
				avatarUrl: users.avatarUrl,
			},
			prompt: {
				title: prompts.title,
				slug: prompts.slug,
			},
		})
		.from(reviews)
		.innerJoin(prompts, eq(reviews.promptId, prompts.id))
		.innerJoin(users, eq(reviews.reviewerId, users.id))
		.where(eq(prompts.sellerId, userId))
		.orderBy(desc(reviews.createdAt));

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-bold text-gray-900 tracking-tight">
					Reviews Received
				</h1>
				<p className="text-gray-500 mt-1">
					See what your customers are saying about your prompts.
				</p>
			</div>

			<div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
				{userReviews.length > 0 ? (
					<ul className="divide-y divide-gray-100">
						{userReviews.map((review) => (
							<li key={review.id} className="p-6">
								<div className="flex flex-col sm:flex-row gap-6">
									{/* Reviewer Info */}
									<div className="flex items-start gap-3 w-full sm:w-64 shrink-0">
										{review.reviewer.avatarUrl ? (
											<img
												src={review.reviewer.avatarUrl}
												alt={review.reviewer.name}
												className="w-10 h-10 rounded-full border border-gray-200 object-cover"
											/>
										) : (
											<div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
												{review.reviewer.name.charAt(0)}
											</div>
										)}
										<div>
											<p className="font-semibold text-gray-900 text-sm">
												{review.reviewer.name}
											</p>
											<p className="text-xs text-gray-500 mt-0.5">
												{new Date(
													review.createdAt,
												).toLocaleDateString("en-US", {
													month: "long",
													day: "numeric",
													year: "numeric",
												})}
											</p>
										</div>
									</div>

									{/* Review Content */}
									<div className="flex-1">
										<div className="flex items-center gap-1 mb-2">
											{[...Array(5)].map((_, i) => (
												<Star
													key={i}
													className={`w-4 h-4 ${
														i < review.rating
															? "text-amber-500 fill-amber-500"
															: "text-gray-300"
													}`}
												/>
											))}
										</div>
										{review.comment ? (
											<p className="text-gray-700 text-sm leading-relaxed mb-3">
												&quot;{review.comment}&quot;
											</p>
										) : (
											<p className="text-gray-400 text-sm italic mb-3">
												No comment provided.
											</p>
										)}
										<div className="inline-flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-xs font-medium text-gray-600">
											<span>Prompt:</span>
											<Link
												href={`/prompt/${review.prompt.slug}`}
												className="text-indigo-600 hover:text-indigo-700 hover:underline truncate max-w-[200px]"
											>
												{review.prompt.title}
											</Link>
										</div>
									</div>
								</div>
							</li>
						))}
					</ul>
				) : (
					<div className="flex flex-col items-center justify-center p-16 text-center">
						<div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
							<MessageSquare className="w-8 h-8 text-gray-300" />
						</div>
						<h3 className="text-xl font-bold text-gray-900 mb-2">
							No reviews yet
						</h3>
						<p className="text-gray-500 max-w-sm mx-auto">
							When customers purchase and review your prompts,
							they will appear here.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
