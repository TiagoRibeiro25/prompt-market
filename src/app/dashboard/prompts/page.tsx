import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { prompts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Plus, Edit, Package, Star, ArrowUpRight } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
	switch (status) {
		case "active":
			return (
				<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
					Active
				</span>
			);
		case "paused":
			return (
				<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
					Paused
				</span>
			);
		case "draft":
			return (
				<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
					Draft
				</span>
			);
		default:
			return null;
	}
}

export default async function DashboardPromptsPage() {
	const { userId } = await auth();

	if (!userId) {
		redirect("/sign-in");
	}

	const userPrompts = await db
		.select()
		.from(prompts)
		.where(eq(prompts.sellerId, userId))
		.orderBy(desc(prompts.createdAt));

	return (
		<div className="space-y-8">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 tracking-tight">
						My Prompts
					</h1>
					<p className="text-gray-500 mt-1">
						Manage your prompt listings, edit details, and track performance.
					</p>
				</div>
				<Link
					href="/dashboard/prompts/new"
					className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
				>
					<Plus className="w-4 h-4" />
					Create Prompt
				</Link>
			</div>

			<div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
				{userPrompts.length > 0 ? (
					<ul className="divide-y divide-gray-100">
						{userPrompts.map((prompt) => (
							<li
								key={prompt.id}
								className="p-6 hover:bg-gray-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-6"
							>
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-3 mb-2">
										<h3 className="text-lg font-bold text-gray-900 truncate">
											{prompt.title}
										</h3>
										<StatusBadge status={prompt.status} />
									</div>
									<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
										<span className="uppercase tracking-wider font-semibold text-xs bg-gray-100 px-2 py-0.5 rounded-md">
											{prompt.category.replace("_", " ")}
										</span>
										<span className="flex items-center gap-1 font-medium">
											{prompt.isFree ? (
												<span className="text-green-600">Free</span>
											) : (
												`$${prompt.price}`
											)}
										</span>
										<span className="flex items-center gap-1">
											• {prompt.totalSales} sales
										</span>
										<span className="flex items-center gap-1">
											• <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
											{prompt.averageRating}
										</span>
									</div>
								</div>

								<div className="flex items-center gap-3 shrink-0">
									<Link
										href={`/prompt/${prompt.slug}`}
										target="_blank"
										className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
										title="View Public Page"
									>
										<ArrowUpRight className="w-5 h-5" />
									</Link>
									<Link
										href={`/dashboard/prompts/${prompt.id}/edit`}
										className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
									>
										<Edit className="w-4 h-4" />
										Edit
									</Link>
								</div>
							</li>
						))}
					</ul>
				) : (
					<div className="flex flex-col items-center justify-center p-16 text-center">
						<div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
							<Package className="w-8 h-8 text-gray-400" />
						</div>
						<h3 className="text-xl font-bold text-gray-900 mb-2">
							No prompts created yet
						</h3>
						<p className="text-gray-500 max-w-sm mx-auto mb-6">
							Get started by creating your first prompt listing to share with the community.
						</p>
						<Link
							href="/dashboard/prompts/new"
							className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-900 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all active:scale-95"
						>
							<Plus className="w-4 h-4" />
							Create your first prompt
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
