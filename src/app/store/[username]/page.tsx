/* eslint-disable @next/next/no-img-element */
import { db } from "@/db";
import { prompts } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { PromptCard } from "@/components/PromptCard";
import { Star, Package, CheckCircle2, Calendar } from "lucide-react";

export default async function StoreProfilePage({
	params,
}: {
	params: Promise<{ username: string }>;
}) {
	const { username } = await params;
	const decodedUsername = decodeURIComponent(username);

	// Try to find the user by storeName, fallback to id if storeName isn't set yet
	const seller = await db.query.users.findFirst({
		where: (users, { or, eq }) =>
			or(
				eq(users.storeName, decodedUsername),
				eq(users.id, decodedUsername),
			),
	});

	if (!seller) {
		notFound();
	}

	// Fetch all active prompts for this seller
	const sellerPrompts = await db
		.select()
		.from(prompts)
		.where(
			and(eq(prompts.sellerId, seller.id), eq(prompts.status, "active")),
		)
		.orderBy(desc(prompts.createdAt));

	// Calculate overall seller stats
	const totalSales = sellerPrompts.reduce((sum, p) => sum + p.totalSales, 0);
	const promptsWithRatings = sellerPrompts.filter(
		(p) => Number(p.averageRating) > 0,
	);
	const averageRating =
		promptsWithRatings.length > 0
			? (
					promptsWithRatings.reduce(
						(sum, p) => sum + Number(p.averageRating),
						0,
					) / promptsWithRatings.length
				).toFixed(2)
			: "0.00";

	return (
		<div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
			<Navbar />

			{/* Store Header / Hero */}
			<div className="bg-white border-b border-gray-200">
				{/* Banner Pattern */}
				<div className="h-48 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 relative overflow-hidden">
					<div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
				</div>

				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
					<div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8 -mt-16 sm:-mt-20">
						{/* Avatar */}
						<div className="relative">
							{seller.avatarUrl ? (
								<img
									src={seller.avatarUrl}
									alt={seller.storeName || seller.name}
									className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl border-4 border-white shadow-xl object-cover bg-white"
								/>
							) : (
								<div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl border-4 border-white shadow-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-5xl">
									{seller.name.charAt(0)}
								</div>
							)}
							<div
								className="absolute bottom-2 right-2 bg-green-500 w-5 h-5 rounded-full border-2 border-white"
								title="Verified Seller"
							></div>
						</div>

						{/* Info */}
						<div className="flex-1 text-center sm:text-left mb-2">
							<h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center justify-center sm:justify-start gap-2">
								{seller.storeName || seller.name}
								<CheckCircle2 className="w-6 h-6 text-blue-500" />
							</h1>

							<div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 mt-3 text-sm font-medium text-gray-600">
								<div className="flex items-center gap-1.5">
									<Package className="w-4 h-4 text-gray-400" />
									{sellerPrompts.length} Prompts
								</div>
								<div className="flex items-center gap-1.5">
									<Star className="w-4 h-4 text-amber-500 fill-amber-500" />
									{averageRating} Store Rating
								</div>
								<div className="flex items-center gap-1.5">
									<Calendar className="w-4 h-4 text-gray-400" />
									Joined{" "}
									{new Date(seller.createdAt).getFullYear()}
								</div>
							</div>
						</div>
					</div>

					{/* Bio Section */}
					{seller.bio && (
						<div className="mt-8 max-w-3xl text-center sm:text-left">
							<h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
								About the Creator
							</h3>
							<p className="text-gray-600 leading-relaxed">
								{seller.bio}
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Prompts Grid */}
			<main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="flex items-center justify-between mb-8">
					<h2 className="text-2xl font-bold text-gray-900 tracking-tight">
						Prompts by {seller.storeName || seller.name}
					</h2>
					<span className="bg-indigo-50 text-indigo-700 text-sm font-bold px-3 py-1 rounded-full border border-indigo-100">
						{totalSales} Total Sales
					</span>
				</div>

				{sellerPrompts.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
						{sellerPrompts.map((prompt) => (
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
					<div className="text-center py-20 bg-white border border-gray-200 rounded-3xl">
						<Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
						<h3 className="text-xl font-bold text-gray-900 mb-2">
							No prompts available
						</h3>
						<p className="text-gray-500 max-w-sm mx-auto">
							This creator hasn&apos;t published any active
							prompts yet. Check back later!
						</p>
					</div>
				)}
			</main>
		</div>
	);
}
