import { db } from "@/db";
import { users, prompts, purchases } from "@/db/schema";
import { count, sum } from "drizzle-orm";
import { Users, FileText, ShoppingCart, DollarSign } from "lucide-react";

export default async function AdminOverviewPage() {
	// Fetch all stats concurrently for performance
	const [
		usersCountResult,
		promptsCountResult,
		purchasesCountResult,
		revenueResult,
	] = await Promise.all([
		db.select({ count: count() }).from(users),
		db.select({ count: count() }).from(prompts),
		db.select({ count: count() }).from(purchases),
		db.select({ total: sum(purchases.amountPaid) }).from(purchases),
	]);

	const totalUsers = usersCountResult[0]?.count ?? 0;
	const totalPrompts = promptsCountResult[0]?.count ?? 0;
	const totalPurchases = purchasesCountResult[0]?.count ?? 0;
	const totalRevenue = revenueResult[0]?.total ? Number(revenueResult[0].total) : 0;

	const statCards = [
		{
			title: "Total Revenue (Platform)",
			value: `$${totalRevenue.toFixed(2)}`,
			icon: DollarSign,
			color: "text-green-600",
			bgColor: "bg-green-50",
			borderColor: "border-green-100",
		},
		{
			title: "Total Purchases",
			value: totalPurchases.toLocaleString(),
			icon: ShoppingCart,
			color: "text-blue-600",
			bgColor: "bg-blue-50",
			borderColor: "border-blue-100",
		},
		{
			title: "Total Users",
			value: totalUsers.toLocaleString(),
			icon: Users,
			color: "text-purple-600",
			bgColor: "bg-purple-50",
			borderColor: "border-purple-100",
		},
		{
			title: "Total Prompts",
			value: totalPrompts.toLocaleString(),
			icon: FileText,
			color: "text-amber-600",
			bgColor: "bg-amber-50",
			borderColor: "border-amber-100",
		},
	];

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-bold text-gray-900 tracking-tight">
					Platform Overview
				</h1>
				<p className="text-gray-500 mt-1">
					High-level metrics for the entire PromptMarket platform.
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				{statCards.map((stat) => (
					<div
						key={stat.title}
						className={`bg-white p-6 rounded-2xl border ${stat.borderColor} shadow-sm relative overflow-hidden`}
					>
						<div
							className={`absolute -right-4 -top-4 w-24 h-24 ${stat.bgColor} rounded-full opacity-50 blur-2xl pointer-events-none`}
						></div>
						<div className="flex items-center gap-4 relative z-10">
							<div
								className={`p-3 rounded-xl ${stat.bgColor} ${stat.color} border ${stat.borderColor}`}
							>
								<stat.icon className="w-6 h-6" />
							</div>
							<div>
								<p className="text-sm font-semibold text-gray-500">
									{stat.title}
								</p>
								<p className="text-2xl font-extrabold text-gray-900 mt-0.5">
									{stat.value}
								</p>
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-8 text-center mt-12">
				<h2 className="text-lg font-bold text-gray-900 mb-2">
					Quick Actions
				</h2>
				<p className="text-gray-500 mb-6 max-w-md mx-auto">
					Use the sidebar menu to dive deeper into managing specific platform resources.
				</p>
				<div className="flex flex-wrap justify-center gap-4">
					<a
						href="/admin/prompts"
						className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-colors text-sm"
					>
						Review Prompts
					</a>
					<a
						href="/admin/users"
						className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-colors text-sm"
					>
						Manage Users
					</a>
					<a
						href="/admin/reviews"
						className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-colors text-sm"
					>
						Moderate Reviews
					</a>
				</div>
			</div>
		</div>
	);
}
