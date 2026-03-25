import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Navbar } from "@/components/layout/Navbar";
import {
	LayoutDashboard,
	Users,
	FileText,
	Star,
	ShieldAlert,
	ChevronDown,
} from "lucide-react";

const navigation = [
	{ name: "Platform Stats", href: "/admin", icon: LayoutDashboard },
	{ name: "Manage Prompts", href: "/admin/prompts", icon: FileText },
	{ name: "Manage Users", href: "/admin/users", icon: Users },
	{ name: "Manage Reviews", href: "/admin/reviews", icon: Star },
];

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { userId } = await auth();

	if (!userId) {
		redirect("/sign-in");
	}

	// Verify Admin Role
	const dbUser = await db.query.users.findFirst({
		where: eq(users.id, userId),
	});

	if (!dbUser || dbUser.role !== "admin") {
		redirect("/");
	}

	return (
		<div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans">
			<Navbar />

			<div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 gap-6 md:gap-8">
				{/* Mobile Navigation (Vertical Expanding) */}
				<div className="md:hidden space-y-3">
					<details className="group [&_summary::-webkit-details-marker]:hidden">
						<summary className="flex items-center justify-between px-4 py-3 bg-red-50 border border-red-100 rounded-xl shadow-sm cursor-pointer list-none select-none">
							<span className="flex items-center gap-2 text-sm font-bold text-red-700">
								<ShieldAlert className="w-4 h-4 text-red-600" />
								Admin Menu
							</span>
							<ChevronDown className="w-4 h-4 text-red-500 transition-transform group-open:rotate-180" />
						</summary>
						<div className="mt-2 bg-white border border-gray-200/80 rounded-xl shadow-sm p-2 flex flex-col gap-1">
							{navigation.map((item) => (
								<Link
									key={item.name}
									href={item.href}
									className="group/item flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
								>
									<item.icon className="w-4 h-4 text-gray-400 group-hover/item:text-red-500 transition-colors" />
									{item.name}
								</Link>
							))}
						</div>
					</details>
				</div>

				{/* Desktop Sidebar Navigation */}
				<aside className="w-64 shrink-0 hidden md:block">
					<div className="sticky top-24">
						<div className="mb-6 px-3 flex items-center gap-2 text-red-600 font-bold uppercase tracking-wider text-sm">
							<ShieldAlert className="w-5 h-5" />
							Admin Panel
						</div>
						<nav className="flex flex-col gap-1.5">
							{navigation.map((item) => (
								<Link
									key={item.name}
									href={item.href}
									className="group flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-600 rounded-xl hover:bg-white hover:text-red-600 hover:shadow-sm border border-transparent hover:border-red-100 transition-all"
								>
									<item.icon className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
									{item.name}
								</Link>
							))}
						</nav>
					</div>
				</aside>

				{/* Main Content Area */}
				<main className="flex-1 min-w-0">{children}</main>
			</div>
		</div>
	);
}
