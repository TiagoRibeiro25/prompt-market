import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { prompts, purchases } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import {
	DollarSign,
	Package,
	ShoppingCart,
	TrendingUp,
	ArrowRight,
	Star,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
	const { userId } = await auth();

	if (!userId) {
		redirect("/sign-in");
	}

	// Fetch user's prompts
	const userPrompts = await db
		.select()
		.from(prompts)
		.where(eq(prompts.sellerId, userId))
		.orderBy(desc(prompts.createdAt));

	const activePromptsCount = userPrompts.filter(
		(p) => p.status === "active",
	).length;

	// Fetch sales data (purchases of prompts owned by this user)
	const salesData = await db
		.select({
			amountPaid: purchases.amountPaid,
			createdAt: purchases.createdAt,
			promptTitle: prompts.title,
		})
		.from(purchases)
		.innerJoin(prompts, eq(purchases.promptId, prompts.id))
		.where(eq(prompts.sellerId, userId))
		.orderBy(desc(purchases.createdAt));

	const totalSales = salesData.length;
	const totalRevenue = salesData.reduce(
		(acc, curr) => acc + Number(curr.amountPaid),
		0,
	);

	const topPrompts = [...userPrompts]
		.sort((a, b) => b.totalSales - a.totalSales)
		.slice(0, 4);

	const statCards = [
		{
			title: "Total Revenue",
			value: `$${totalRevenue.toFixed(2)}`,
			icon: DollarSign,
			color: "text-green-600",
			bgColor: "bg-green-50",
		},
		{
			title: "Total Sales",
			value: totalSales.toString(),
			icon: ShoppingCart,
			color: "text-blue-600",
			bgColor: "bg-blue-50",
		},
		{
			title: "Active Prompts",
			value: activePromptsCount.toString(),
			icon: Package,
			color: "text-indigo-600",
			bgColor: "bg-indigo-50",
		},
		{
			title: "Conversion Rate",
			value: "— %", // Placeholder for future analytics
			icon: TrendingUp,
			color: "text-amber-600",
			bgColor: "bg-amber-50",
		},
	];

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-bold text-gray-900 tracking-tight">
					Overview
				</h1>
				<p className="text-gray-500 mt-1">
					Welcome back! Here&apos;s what&apos;s happening with your
					store today.
				</p>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{statCards.map((stat) => (
					<div
						key={stat.title}
						className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm"
					>
						<div className="flex items-center gap-4">
							<div
								className={`p-3 rounded-xl ${stat.bgColor} ${stat.color}`}
							>
								<stat.icon className="w-6 h-6" />
							</div>
							<div>
								<p className="text-sm font-medium text-gray-500">
									{stat.title}
								</p>
								<p className="text-2xl font-bold text-gray-900 mt-0.5">
									{stat.value}
								</p>
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Top Performing Prompts */}
				<div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col">
					<div className="p-6 border-b border-gray-100 flex items-center justify-between">
						<h2 className="text-lg font-bold text-gray-900">
							Top Performing Prompts
						</h2>
						<Link
							href="/dashboard/prompts"
							className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
						>
							View all <ArrowRight className="w-4 h-4" />
						</Link>
					</div>
					<div className="flex-1 p-0">
						{topPrompts.length > 0 ? (
							<ul className="divide-y divide-gray-100">
								{topPrompts.map((prompt) => (
									<li
										key={prompt.id}
										className="p-6 hover:bg-gray-50/50 transition-colors flex items-center justify-between gap-4"
									>
										<div className="min-w-0 flex-1">
											<p className="text-sm font-semibold text-gray-900 truncate">
												{prompt.title}
											</p>
											<div className="flex items-center gap-3 mt-1">
												<span className="text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-md">
													{prompt.category.replace(
														"_",
														" ",
													)}
												</span>
												<span className="text-xs text-gray-500 flex items-center gap-1">
													<Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
													{prompt.averageRating}
												</span>
											</div>
										</div>
										<div className="text-right shrink-0">
											<p className="text-sm font-bold text-gray-900">
												{prompt.totalSales} sales
											</p>
											<p className="text-sm font-medium text-green-600 mt-0.5">
												$
												{(
													prompt.totalSales *
													Number(prompt.price)
												).toFixed(2)}
											</p>
										</div>
									</li>
								))}
							</ul>
						) : (
							<div className="h-full flex flex-col items-center justify-center p-12 text-center">
								<Package className="w-12 h-12 text-gray-300 mb-4" />
								<p className="text-gray-500 font-medium">
									You haven&apos;t created any prompts yet.
								</p>
								<Link
									href="/dashboard/prompts/new"
									className="mt-4 text-sm font-semibold bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
								>
									Create your first prompt
								</Link>
							</div>
						)}
					</div>
				</div>

				{/* Recent Sales Activity */}
				<div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm flex flex-col">
					<div className="p-6 border-b border-gray-100">
						<h2 className="text-lg font-bold text-gray-900">
							Recent Sales
						</h2>
					</div>
					<div className="p-6 flex-1">
						{salesData.length > 0 ? (
							<div className="space-y-6">
								{salesData.slice(0, 5).map((sale, i) => (
									<div
										key={i}
										className="flex items-center justify-between"
									>
										<div className="min-w-0 flex-1 pr-4">
											<p className="text-sm font-semibold text-gray-900 truncate">
												{sale.promptTitle}
											</p>
											<p className="text-xs text-gray-500 mt-1">
												{new Date(
													sale.createdAt,
												).toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
													hour: "numeric",
													minute: "2-digit",
												})}
											</p>
										</div>
										<span className="text-sm font-bold text-green-600 shrink-0">
											+$
											{Number(sale.amountPaid).toFixed(2)}
										</span>
									</div>
								))}
							</div>
						) : (
							<div className="h-full flex flex-col items-center justify-center text-center">
								<ShoppingCart className="w-10 h-10 text-gray-300 mb-3" />
								<p className="text-sm text-gray-500">
									No sales yet. Share your prompts to start
									earning!
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
