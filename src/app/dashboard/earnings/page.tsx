import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { prompts, purchases, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import {
	DollarSign,
	TrendingUp,
	CheckCircle2,
	AlertCircle,
	ExternalLink,
	CreditCard,
} from "lucide-react";

export default async function EarningsPage() {
	const { userId } = await auth();

	if (!userId) {
		redirect("/sign-in");
	}

	// Fetch user's Stripe Connect status
	const dbUser = await db.query.users.findFirst({
		where: eq(users.id, userId),
	});

	if (!dbUser) {
		redirect("/onboarding");
	}

	// Fetch all sales data for this user's prompts
	const salesData = await db
		.select({
			id: purchases.id,
			amountPaid: purchases.amountPaid,
			createdAt: purchases.createdAt,
			promptTitle: prompts.title,
			isFree: prompts.isFree,
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

	// Assume a 10% platform fee for the net earnings calculation
	const netEarnings = totalRevenue * 0.9;

	// Filter only paid sales for the history table
	const paidSales = salesData.filter(
		(sale) => !sale.isFree && Number(sale.amountPaid) > 0,
	);

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-bold text-gray-900 tracking-tight">
					Earnings & Payouts
				</h1>
				<p className="text-gray-500 mt-1">
					Track your sales, manage your connected Stripe account, and view your payout history.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-4">
					<div className="p-3 bg-green-50 text-green-600 rounded-xl">
						<DollarSign className="w-6 h-6" />
					</div>
					<div>
						<p className="text-sm font-semibold text-gray-500">
							Net Earnings (After Fees)
						</p>
						<p className="text-2xl font-bold text-gray-900 mt-0.5">
							${netEarnings.toFixed(2)}
						</p>
					</div>
				</div>

				<div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-4">
					<div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
						<TrendingUp className="w-6 h-6" />
					</div>
					<div>
						<p className="text-sm font-semibold text-gray-500">
							Gross Volume
						</p>
						<p className="text-2xl font-bold text-gray-900 mt-0.5">
							${totalRevenue.toFixed(2)}
						</p>
					</div>
				</div>

				<div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-4">
					<div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
						<CreditCard className="w-6 h-6" />
					</div>
					<div>
						<p className="text-sm font-semibold text-gray-500">
							Total Sales Count
						</p>
						<p className="text-2xl font-bold text-gray-900 mt-0.5">
							{totalSales}
						</p>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Stripe Connect Panel */}
				<div className="lg:col-span-1">
					<div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
						<h2 className="text-lg font-bold text-gray-900 mb-4">
							Payout Settings
						</h2>

						{dbUser.stripeOnboarded ? (
							<div className="space-y-4">
								<div className="flex items-start gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
									<CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
									<div>
										<p className="text-sm font-bold text-green-900">
											Stripe Connected
										</p>
										<p className="text-xs text-green-700 mt-1 leading-relaxed">
											Your account is active and you are ready to receive payouts automatically.
										</p>
									</div>
								</div>

								{/*
									In a real app, this would be a server action that creates a Stripe Express Dashboard login link
									using stripe.accounts.createLoginLink(stripeAccountId)
								*/}
								<button className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
									View Stripe Dashboard
									<ExternalLink className="w-4 h-4" />
								</button>
							</div>
						) : (
							<div className="space-y-4">
								<div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
									<AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
									<div>
										<p className="text-sm font-bold text-amber-900">
											Action Required
										</p>
										<p className="text-xs text-amber-700 mt-1 leading-relaxed">
											You must connect a bank account or debit card via Stripe to receive payouts for your premium prompts.
										</p>
									</div>
								</div>

								{/*
									In a real app, this would trigger a server action calling stripe.accountLinks.create()
									to send them to the onboarding flow.
								*/}
								<button className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-colors">
									Connect with Stripe
								</button>
							</div>
						)}
					</div>
				</div>

				{/* Recent Transactions */}
				<div className="lg:col-span-2">
					<div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col h-full">
						<div className="p-6 border-b border-gray-100">
							<h2 className="text-lg font-bold text-gray-900">
								Recent Paid Transactions
							</h2>
						</div>

						<div className="flex-1 overflow-x-auto">
							{paidSales.length > 0 ? (
								<table className="w-full text-left text-sm whitespace-nowrap">
									<thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500">
										<tr>
											<th className="px-6 py-3 font-semibold">Date</th>
											<th className="px-6 py-3 font-semibold">Prompt</th>
											<th className="px-6 py-3 font-semibold text-right">Gross Amount</th>
											<th className="px-6 py-3 font-semibold text-right">Net Earning</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-100">
										{paidSales.map((sale) => {
											const amount = Number(sale.amountPaid);
											const net = amount * 0.9;
											return (
												<tr key={sale.id} className="hover:bg-gray-50/50 transition-colors">
													<td className="px-6 py-4 text-gray-500">
														{new Date(sale.createdAt).toLocaleDateString()}
													</td>
													<td className="px-6 py-4 font-medium text-gray-900">
														{sale.promptTitle}
													</td>
													<td className="px-6 py-4 text-right text-gray-600">
														${amount.toFixed(2)}
													</td>
													<td className="px-6 py-4 text-right font-bold text-green-600">
														+${net.toFixed(2)}
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							) : (
								<div className="flex flex-col items-center justify-center p-12 text-center h-full">
									<div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
										<DollarSign className="w-8 h-8 text-gray-300" />
									</div>
									<h3 className="text-lg font-bold text-gray-900 mb-1">
										No paid sales yet
									</h3>
									<p className="text-gray-500 text-sm max-w-xs mx-auto">
										Share your prompts and start earning. Your transactions will appear here.
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
