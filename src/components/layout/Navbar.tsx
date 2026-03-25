import Link from "next/link";
import {
	Sparkles,
	Compass,
	LayoutDashboard,
	LogIn,
	ShieldAlert,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function Navbar() {
	const { userId } = await auth();

	let isAdmin = false;
	if (userId) {
		const dbUser = await db.query.users.findFirst({
			where: eq(users.id, userId),
		});
		if (dbUser?.role === "admin") {
			isAdmin = true;
		}
	}

	return (
		<header className="sticky top-0 z-50 w-full border-b border-gray-200/50 bg-white/70 backdrop-blur-xl transition-all">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="flex items-center justify-center w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 text-white shadow-sm ring-1 ring-black/5">
						<Sparkles className="h-5 w-5" />
					</div>
					<Link
						href="/"
						className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-linear-to-r from-gray-900 to-gray-700"
					>
						PromptMarket
					</Link>
				</div>

				<nav className="flex items-center gap-4 sm:gap-6">
					<Link
						href="/explore"
						className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
					>
						<Compass className="w-4 h-4" />
						<span className="hidden sm:inline">Explore</span>
					</Link>
					{userId ? (
						<div className="flex items-center gap-4 sm:gap-6">
							<Link
								href="/dashboard"
								className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
							>
								<LayoutDashboard className="w-4 h-4" />
								<span className="hidden sm:inline">
									Dashboard
								</span>
							</Link>
							{isAdmin && (
								<Link
									href="/admin"
									className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
								>
									<ShieldAlert className="w-4 h-4" />
									<span className="hidden sm:inline">
										Admin
									</span>
								</Link>
							)}
							<div className="h-5 w-px bg-gray-200"></div>
							<UserButton
								appearance={{
									elements: {
										avatarBox:
											"w-9 h-9 ring-2 ring-white shadow-sm",
									},
								}}
							/>
						</div>
					) : (
						<>
							<div className="h-5 w-px bg-gray-200 hidden sm:block"></div>
							<Link
								href="/sign-in"
								className="group flex items-center gap-2 text-sm font-semibold bg-gray-900 text-white px-5 py-2.5 rounded-full hover:bg-gray-800 shadow-sm transition-all active:scale-95"
							>
								<LogIn className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
								Sign In
							</Link>
						</>
					)}
				</nav>
			</div>
		</header>
	);
}
