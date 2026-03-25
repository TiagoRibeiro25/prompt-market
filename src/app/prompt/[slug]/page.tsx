/* eslint-disable @next/next/no-img-element */
import { db } from "@/db";
import { prompts, users, reviews } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import {
	Star,
	ShoppingCart,
	Check,
	Tag,
	MessageSquare,
	Image as ImageIcon,
	Terminal,
} from "lucide-react";
import Link from "next/link";

export default async function PromptDetailPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;

	// Fetch prompt details including seller info
	const prompt = await db
		.select({
			prompt: prompts,
			seller: {
				id: users.id,
				name: users.name,
				storeName: users.storeName,
				avatarUrl: users.avatarUrl,
			},
		})
		.from(prompts)
		.innerJoin(users, eq(prompts.sellerId, users.id))
		.where(and(eq(prompts.slug, slug), eq(prompts.status, "active")))
		.limit(1)
		.then((res) => res[0]);

	if (!prompt) {
		notFound();
	}

	// Fetch recent reviews
	const promptReviews = await db
		.select({
			rating: reviews.rating,
			comment: reviews.comment,
			createdAt: reviews.createdAt,
			reviewer: {
				name: users.name,
				avatarUrl: users.avatarUrl,
			},
		})
		.from(reviews)
		.innerJoin(users, eq(reviews.reviewerId, users.id))
		.where(eq(reviews.promptId, prompt.prompt.id))
		.orderBy(desc(reviews.createdAt))
		.limit(10);

	const getCategoryIcon = (cat: string) => {
		if (cat === "midjourney" || cat === "stable_diffusion")
			return <ImageIcon className="w-5 h-5 text-pink-500" />;
		if (cat === "chatgpt" || cat === "claude" || cat === "gemini")
			return <MessageSquare className="w-5 h-5 text-blue-500" />;
		return <Terminal className="w-5 h-5 text-gray-700" />;
	};

	const getCategoryColor = (cat: string) => {
		if (cat === "midjourney" || cat === "stable_diffusion")
			return "bg-pink-50 text-pink-700 border-pink-200";
		if (cat === "chatgpt" || cat === "claude" || cat === "gemini")
			return "bg-blue-50 text-blue-700 border-blue-200";
		return "bg-gray-100 text-gray-700 border-gray-200";
	};

	return (
		<div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans">
			<Navbar />

			<main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="flex flex-col lg:flex-row gap-12">
					{/* Left Column: Details */}
					<div className="flex-1 space-y-10">
						{/* Header */}
						<div>
							<div className="flex items-center gap-3 mb-6">
								<span
									className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${getCategoryColor(
										prompt.prompt.category,
									)}`}
								>
									{getCategoryIcon(prompt.prompt.category)}
									{prompt.prompt.category.replace("_", " ")}
								</span>
								<div className="flex items-center gap-1.5 text-sm font-semibold text-amber-500 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
									<Star className="w-4 h-4 fill-amber-500" />
									{prompt.prompt.averageRating}
								</div>
								<span className="text-sm font-medium text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full shadow-sm">
									{prompt.prompt.totalSales} Sales
								</span>
							</div>

							<h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
								{prompt.prompt.title}
							</h1>

							<p className="text-lg text-gray-600 leading-relaxed whitespace-pre-wrap">
								{prompt.prompt.description}
							</p>
						</div>

						{/* Tags */}
						{prompt.prompt.tags &&
							prompt.prompt.tags.length > 0 && (
								<div className="flex flex-wrap items-center gap-2">
									<Tag className="w-5 h-5 text-gray-400 mr-2" />
									{prompt.prompt.tags.map((tag) => (
										<span
											key={tag}
											className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 shadow-sm hover:border-indigo-200 transition-colors cursor-default"
										>
											#{tag}
										</span>
									))}
								</div>
							)}

						{/* Teaser */}
						<div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-sm relative overflow-hidden">
							<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
							<h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
								Prompt Teaser
							</h3>
							<div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 font-mono text-sm text-gray-700 leading-relaxed relative">
								{prompt.prompt.teaser}
								<div className="mt-4 pt-4 border-t border-gray-200/60 text-center">
									<span className="inline-flex items-center gap-2 text-indigo-600 font-semibold bg-indigo-50 px-4 py-2 rounded-lg">
										<ShoppingCart className="w-4 h-4" />
										Purchase to unlock full prompt
									</span>
								</div>
							</div>
						</div>

						{/* Reviews */}
						<div className="pt-8 border-t border-gray-200">
							<h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
								Reviews
								<span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
									{promptReviews.length}
								</span>
							</h3>

							{promptReviews.length > 0 ? (
								<div className="space-y-6">
									{promptReviews.map((review, i) => (
										<div
											key={i}
											className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm"
										>
											<div className="flex items-center gap-4 mb-4">
												{review.reviewer.avatarUrl ? (
													<img
														src={
															review.reviewer
																.avatarUrl
														}
														alt={
															review.reviewer.name
														}
														className="w-10 h-10 rounded-full border border-gray-200"
													/>
												) : (
													<div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
														{review.reviewer.name.charAt(
															0,
														)}
													</div>
												)}
												<div>
													<p className="font-semibold text-gray-900">
														{review.reviewer.name}
													</p>
													<div className="flex items-center gap-1 mt-0.5">
														{[...Array(5)].map(
															(_, index) => (
																<Star
																	key={index}
																	className={`w-3.5 h-3.5 ${
																		index <
																		review.rating
																			? "text-amber-500 fill-amber-500"
																			: "text-gray-300"
																	}`}
																/>
															),
														)}
													</div>
												</div>
												<span className="ml-auto text-xs text-gray-400 font-medium">
													{new Date(
														review.createdAt,
													).toLocaleDateString()}
												</span>
											</div>
											{review.comment && (
												<p className="text-gray-600 text-sm leading-relaxed">
													{review.comment}
												</p>
											)}
										</div>
									))}
								</div>
							) : (
								<div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 text-center">
									<p className="text-gray-500 font-medium">
										No reviews yet. Be the first to try it
										out!
									</p>
								</div>
							)}
						</div>
					</div>

					{/* Right Column: Sticky Checkout Panel */}
					<div className="lg:w-96 shrink-0">
						<div className="sticky top-24 space-y-6">
							{/* Pricing Card */}
							<div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-200/50">
								<div className="mb-6 pb-6 border-b border-gray-100">
									<span className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">
										Price
									</span>
									<div className="text-5xl font-extrabold text-gray-900 tracking-tight">
										{prompt.prompt.isFree ? (
											<span className="text-green-600">
												Free
											</span>
										) : (
											`$${prompt.prompt.price}`
										)}
									</div>
								</div>

								<div className="space-y-4 mb-8">
									<div className="flex items-center gap-3 text-gray-600 font-medium">
										<div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
											<Check className="w-3.5 h-3.5" />
										</div>
										Instant access to full prompt
									</div>
									<div className="flex items-center gap-3 text-gray-600 font-medium">
										<div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
											<Check className="w-3.5 h-3.5" />
										</div>
										Lifetime updates
									</div>
									<div className="flex items-center gap-3 text-gray-600 font-medium">
										<div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
											<Check className="w-3.5 h-3.5" />
										</div>
										Leave a review after purchase
									</div>
								</div>

								<Link
									href={`/checkout/${prompt.prompt.slug}`}
									className="group flex items-center justify-center gap-2 w-full bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-md transition-all active:scale-95"
								>
									{prompt.prompt.isFree
										? "Claim Now"
										: "Buy Prompt"}
								</Link>
								<p className="text-center text-xs text-gray-400 mt-4 font-medium">
									Secure transaction powered by Stripe
								</p>
							</div>

							{/* Seller Profile Card */}
							<div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm">
								<span className="block text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">
									Created By
								</span>
								<div className="flex items-center gap-4 mb-4">
									{prompt.seller.avatarUrl ? (
										<img
											src={prompt.seller.avatarUrl}
											alt={prompt.seller.name}
											className="w-14 h-14 rounded-full border-2 border-indigo-50"
										/>
									) : (
										<div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl border-2 border-indigo-50">
											{prompt.seller.name.charAt(0)}
										</div>
									)}
									<div>
										<h4 className="font-bold text-gray-900 text-lg">
											{prompt.seller.storeName ||
												prompt.seller.name}
										</h4>
										<Link
											href={`/store/${prompt.seller.storeName || prompt.seller.id}`}
											className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
										>
											View Store
										</Link>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
