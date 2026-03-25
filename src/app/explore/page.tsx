import { db } from "@/db";
import { prompts } from "@/db/schema";
import { eq, desc, ilike, and, or, asc } from "drizzle-orm";
import { Navbar } from "@/components/layout/Navbar";
import { PromptCard } from "@/components/PromptCard";
import { Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";

export default async function ExplorePage({
	searchParams,
}: {
	searchParams: Promise<{ q?: string; sort?: string }>;
}) {
	const params = await searchParams;
	const q = params?.q || "";
	const sort = params?.sort || "newest";

	const conditions = [eq(prompts.status, "active")];

	if (q) {
		conditions.push(
			or(
				ilike(prompts.title, `%${q}%`),
				ilike(prompts.description, `%${q}%`),
			)!,
		);
	}

	let orderByClause = desc(prompts.createdAt);
	if (sort === "popular") {
		orderByClause = desc(prompts.totalSales);
	} else if (sort === "price_asc") {
		orderByClause = asc(prompts.price);
	} else if (sort === "price_desc") {
		orderByClause = desc(prompts.price);
	}

	const explorePrompts = await db
		.select()
		.from(prompts)
		.where(and(...conditions))
		.orderBy(orderByClause);

	return (
		<div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
			<Navbar />

			<main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
					<div className="max-w-2xl">
						<h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
							Explore Prompts
						</h1>
						<p className="text-lg text-gray-600">
							Browse our entire collection of high-quality,
							premium AI prompts crafted by experts.
						</p>
					</div>

					<form
						method="GET"
						action="/explore"
						className="w-full md:w-auto shrink-0 flex items-center gap-3"
					>
						<div className="relative w-full md:w-80">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<Search className="h-5 w-5 text-gray-400" />
							</div>
							<input
								type="text"
								name="q"
								defaultValue={q}
								placeholder="Search prompts..."
								className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200/80 bg-white shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
							/>
						</div>
						{sort && (
							<input type="hidden" name="sort" value={sort} />
						)}
						<button
							type="submit"
							className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm hidden md:block"
						>
							Search
						</button>
					</form>
				</div>

				{/* Filters & Categories */}
				<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
					<div className="flex flex-wrap items-center gap-2">
						<Link
							href={`/explore${q ? `?q=${q}` : ""}`}
							className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-900 text-white shadow-sm transition-all"
						>
							All
						</Link>
						{CATEGORIES.map((cat) => (
							<Link
								key={cat}
								href={`/explore/${cat}${q ? `?q=${q}` : ""}`}
								className="px-4 py-2 rounded-full text-sm font-semibold bg-white border border-gray-200/80 text-gray-600 hover:border-indigo-200 hover:text-indigo-600 shadow-sm transition-all capitalize"
							>
								{cat.replace("_", " ")}
							</Link>
						))}
					</div>

					<div className="flex items-center gap-2 bg-white border border-gray-200/80 rounded-xl p-1 shadow-sm w-full lg:w-auto overflow-x-auto">
						<Link
							href={`/explore?sort=newest${q ? `&q=${q}` : ""}`}
							className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
								sort === "newest" || !sort
									? "bg-gray-100 text-gray-900"
									: "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
							}`}
						>
							Newest
						</Link>
						<Link
							href={`/explore?sort=popular${q ? `&q=${q}` : ""}`}
							className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
								sort === "popular"
									? "bg-gray-100 text-gray-900"
									: "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
							}`}
						>
							Popular
						</Link>
						<Link
							href={`/explore?sort=price_asc${q ? `&q=${q}` : ""}`}
							className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
								sort === "price_asc"
									? "bg-gray-100 text-gray-900"
									: "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
							}`}
						>
							Lowest Price
						</Link>
					</div>
				</div>

				{/* Prompts Grid */}
				{explorePrompts.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
						{explorePrompts.map((prompt) => (
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
								averageRating={prompt.averageRating ?? "0"}
							/>
						))}
					</div>
				) : (
					<div className="text-center py-32 bg-white border-2 border-dashed rounded-3xl border-gray-200">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
							<Sparkles className="w-8 h-8 text-gray-400" />
						</div>
						<h3 className="text-xl font-bold text-gray-900 mb-2">
							No prompts found
						</h3>
						<p className="text-gray-500 max-w-sm mx-auto">
							We couldn&apos;t find any prompts matching your
							search criteria. Try adjusting your filters or
							search query.
						</p>
						{(q || sort !== "newest") && (
							<Link
								href="/explore"
								className="mt-6 inline-flex items-center justify-center bg-indigo-50 text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-100 transition-colors"
							>
								Clear all filters
							</Link>
						)}
					</div>
				)}
			</main>
		</div>
	);
}
