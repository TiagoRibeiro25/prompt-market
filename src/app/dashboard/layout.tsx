import Link from "next/link";
import {
	LayoutDashboard,
	FileText,
	ShoppingBag,
	DollarSign,
	Star,
	Settings,
	Plus,
	Menu,
	ChevronDown,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

const navigation = [
	{ name: "Overview", href: "/dashboard", icon: LayoutDashboard },
	{ name: "My Prompts", href: "/dashboard/prompts", icon: FileText },
	{ name: "Purchases", href: "/dashboard/purchases", icon: ShoppingBag },
	{ name: "Earnings", href: "/dashboard/earnings", icon: DollarSign },
	{ name: "Reviews", href: "/dashboard/reviews", icon: Star },
	{ name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans">
			<Navbar />

			<div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 gap-6 md:gap-8">
				{/* Mobile Navigation (Vertical Expanding) */}
				<div className="md:hidden space-y-3">
					<details className="group [&_summary::-webkit-details-marker]:hidden">
						<summary className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200/80 rounded-xl shadow-sm cursor-pointer list-none select-none">
							<span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
								<Menu className="w-4 h-4 text-gray-500" />
								Dashboard Menu
							</span>
							<ChevronDown className="w-4 h-4 text-gray-500 transition-transform group-open:rotate-180" />
						</summary>
						<div className="mt-2 bg-white border border-gray-200/80 rounded-xl shadow-sm p-2 flex flex-col gap-1">
							{navigation.map((item) => (
								<Link
									key={item.name}
									href={item.href}
									className="group/item flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-600 rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition-colors"
								>
									<item.icon className="w-4 h-4 text-gray-400 group-hover/item:text-indigo-500 transition-colors" />
									{item.name}
								</Link>
							))}
						</div>
					</details>

					<Link
						href="/dashboard/prompts/new"
						className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white px-4 py-3 rounded-xl font-semibold text-sm hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
					>
						<Plus className="w-4 h-4" />
						Create Prompt
					</Link>
				</div>

				{/* Desktop Sidebar Navigation */}
				<aside className="w-64 shrink-0 hidden md:block">
					<div className="sticky top-24">
						<nav className="flex flex-col gap-1.5">
							<div className="px-3 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
								Menu
							</div>
							{navigation.map((item) => (
								<Link
									key={item.name}
									href={item.href}
									className="group flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-600 rounded-xl hover:bg-white hover:text-indigo-600 hover:shadow-sm border border-transparent hover:border-gray-200/60 transition-all"
								>
									<item.icon className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
									{item.name}
								</Link>
							))}
						</nav>

						{/* Quick Actions */}
						<div className="mt-8">
							<div className="px-3 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
								Actions
							</div>
							<Link
								href="/dashboard/prompts/new"
								className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 shadow-sm transition-all active:scale-95 mt-2"
							>
								<Plus className="w-4 h-4" />
								Create Prompt
							</Link>
						</div>
					</div>
				</aside>

				{/* Main Content Area */}
				<main className="flex-1 min-w-0">{children}</main>
			</div>
		</div>
	);
}
