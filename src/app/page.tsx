import Link from "next/link";
import { db } from "@/db";
import { prompts, categoryEnum } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import {
	ArrowRight,
	Sparkles,
	Zap,
	Image as ImageIcon,
	MessageSquare,
	Terminal,
	TrendingUp,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { PromptCard } from "@/components/PromptCard";

export default async function HomePage() {
	// Fetch featured/latest prompts
	const featuredPrompts = await db
		.select()
		.from(prompts)
		.where(eq(prompts.status, "active"))
		.orderBy(desc(prompts.createdAt))
		.limit(6);

	const categories = categoryEnum.enumValues;

	const getCategoryIcon = (cat: string) => {
		if (cat === "midjourney" || cat === "stable_diffusion")
			return <ImageIcon className="w-6 h-6 text-pink-500" />;
		if (cat === "chatgpt" || cat === "claude" || cat === "gemini")
			return <MessageSquare className="w-6 h-6 text-blue-500" />;
		return <Terminal className="w-6 h-6 text-gray-700" />;
	};

	return (
		<div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
			<Navbar />

			<main className="flex-1">
				{/* Hero Section */}
				<section className="relative overflow-hidden pt-24 pb-32">
					{/* Decorative Background */}
					<div className="absolute inset-0 -z-10 h-full w-full bg-[#FAFAFA] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px]">
						<div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 h-125 w-200 rounded-full bg-indigo-400 opacity-10 blur-[100px]"></div>
					</div>

					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
						<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm mb-8">
							<Sparkles className="h-4 w-4 text-indigo-500" />
							<span className="text-sm font-medium text-gray-600">
								The #1 Marketplace for AI Prompts
							</span>
						</div>

						<h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight">
							Supercharge your AI with{" "}
							<br className="hidden md:block" />
							<span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient-x">
								Premium Instructions
							</span>
						</h1>

						<p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
							Discover, buy, and sell expertly crafted prompts for
							Midjourney, ChatGPT, Claude, and more. Stop
							guessing, start generating.
						</p>

						<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
							<Link
								href="/explore"
								className="group flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-800 shadow-xl shadow-gray-900/20 transition-all active:scale-95 w-full sm:w-auto"
							>
								Explore Prompts
								<ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
							</Link>
							<Link
								href="/sign-in"
								className="group flex items-center justify-center gap-2 bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all active:scale-95 w-full sm:w-auto"
							>
								Start Selling
							</Link>
						</div>

						<div className="mt-12 flex items-center justify-center gap-6 text-sm font-medium text-gray-500">
							<div className="flex items-center gap-1.5">
								<TrendingUp className="w-5 h-5 text-indigo-500" />
								Instant Access
							</div>
						</div>
					</div>
				</section>

				{/* Categories Section */}
				<section className="py-20 bg-white border-y border-gray-100">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
							<div>
								<h2 className="text-3xl font-bold text-gray-900 tracking-tight">
									Browse by Model
								</h2>
								<p className="text-gray-500 mt-2">
									Find the perfect starting point for your
									favorite AI.
								</p>
							</div>
							<Link
								href="/explore"
								className="text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-1"
							>
								View all categories{" "}
								<ArrowRight className="w-4 h-4" />
							</Link>
						</div>

						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							{categories.map((cat) => (
								<Link
									key={cat}
									href={`/explore/${cat}`}
									className="group bg-[#FAFAFA] border border-gray-200/80 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-200 transition-all duration-300"
								>
									<div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 group-hover:scale-110 transition-transform duration-300">
										{getCategoryIcon(cat)}
									</div>
									<span className="font-semibold text-gray-900 capitalize tracking-tight">
										{cat.replace("_", " ")}
									</span>
								</Link>
							))}
						</div>
					</div>
				</section>

				{/* Featured Prompts Section */}
				<section className="py-24 bg-[#FAFAFA]">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex items-center justify-between mb-12">
							<h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3 tracking-tight">
								<div className="p-2 bg-yellow-100 rounded-lg">
									<Zap className="h-6 w-6 text-yellow-600" />
								</div>
								Trending Prompts
							</h2>
						</div>

						{featuredPrompts.length > 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
								{featuredPrompts.map((prompt) => (
									<PromptCard
										key={prompt.id}
										id={prompt.id}
										slug={prompt.slug}
										title={prompt.title}
										description={prompt.description}
										category={prompt.category}
										price={prompt.price}
										isFree={prompt.isFree}
										totalSales={prompt.totalSales}
										averageRating={
											prompt.averageRating ?? "0"
										}
									/>
								))}
							</div>
						) : (
							<div className="text-center py-20 bg-white border-2 border-dashed rounded-3xl border-gray-200">
								<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
									<Sparkles className="w-8 h-8 text-gray-400" />
								</div>
								<h3 className="text-xl font-bold text-gray-900 mb-2">
									No prompts yet
								</h3>
								<p className="text-gray-500 max-w-sm mx-auto">
									The marketplace is brand new. Be the first
									to create and list a premium prompt!
								</p>
							</div>
						)}
					</div>
				</section>
			</main>

			{/* Footer */}
			<footer className="bg-white border-t border-gray-200 py-12">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
					<div className="flex items-center gap-2">
						<Sparkles className="h-5 w-5 text-gray-400" />
						<span className="font-bold text-lg tracking-tight text-gray-900">
							PromptMarket
						</span>
					</div>
					<p className="text-gray-500 text-sm font-medium">
						© {new Date().getFullYear()} PromptMarket. Built for AI
						Engineers.
					</p>
				</div>
			</footer>
		</div>
	);
}
