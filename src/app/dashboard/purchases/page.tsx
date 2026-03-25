import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { prompts, purchases } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { PromptCard } from "@/components/PromptCard";
import { Library as LibraryIcon, Search } from "lucide-react";
import Link from "next/link";

export default async function LibraryPage() {
	const { userId } = await auth();

	if (!userId) {
		redirect("/sign-in");
	}

	// Fetch all prompts the user has purchased
	const userPurchases = await db
		.select({
			prompt: prompts,
			purchasedAt: purchases.createdAt,
		})
		.from(purchases)
		.innerJoin(prompts, eq(purchases.promptId, prompts.id))
		.where(eq(purchases.buyerId, userId))
		.orderBy(desc(purchases.createdAt));

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-bold text-gray-900 tracking-tight">
					My Purchases
				</h1>
				<p className="text-gray-500 mt-1">
					All the prompts you have unlocked are stored here. Click on
					any prompt to reveal the secret sauce.
				</p>
			</div>

			{/* Prompts Grid */}
			{userPurchases.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
					{userPurchases.map(({ prompt }) => (
						<div key={prompt.id} className="relative group">
							{/* Override the PromptCard link to point to library reveal page instead of public explore page */}
							<Link
								href={`/dashboard/purchases/${prompt.slug}`}
								className="absolute inset-0 z-10"
								aria-label={`View ${prompt.title}`}
							/>
							<div className="h-full pointer-events-none">
								<PromptCard
									id={prompt.id}
									slug={prompt.slug} // This link is overridden by the absolute overlay above
									title={prompt.title}
									description={prompt.description}
									category={prompt.category}
									price={prompt.price}
									isFree={prompt.isFree}
									totalSales={prompt.totalSales}
									averageRating={prompt.averageRating ?? "0"}
								/>
							</div>

							<div className="absolute top-4 right-4 z-20 pointer-events-none">
								<span className="bg-white/90 backdrop-blur-md text-green-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-green-200">
									Unlocked
								</span>
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="text-center py-32 bg-white border-2 border-dashed rounded-3xl border-gray-200">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 mb-4">
						<LibraryIcon className="w-8 h-8 text-indigo-600" />
					</div>
					<h3 className="text-xl font-bold text-gray-900 mb-2">
						You have not purchased anything yet
					</h3>
					<p className="text-gray-500 max-w-sm mx-auto mb-8">
						You haven&apos;t purchased or claimed any prompts yet.
						Explore the marketplace to find your first one!
					</p>
					<Link
						href="/explore"
						className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
					>
						<Search className="w-5 h-5" />
						Explore Marketplace
					</Link>
				</div>
			)}
		</div>
	);
}
