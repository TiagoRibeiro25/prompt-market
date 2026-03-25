import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { completeOnboarding } from "./actions";

export default async function OnboardingPage() {
	const { userId } = await auth();

	if (!userId) {
		redirect("/sign-in");
	}

	const user = await currentUser();

	// Check if user already completed onboarding
	let dbUser = await db.query.users.findFirst({
		where: eq(users.id, userId),
	});

	if (dbUser?.storeName) {
		redirect("/dashboard");
	}

	// Dev-only fallback: Sync user directly if they don't exist yet and we're not in production
	// In production, the svix webhook handles this.
	if (!dbUser && process.env.NODE_ENV === "development") {
		if (!user) {
			redirect("/sign-in");
		}

		const email = user.emailAddresses[0]?.emailAddress;
		const name =
			[user.firstName, user.lastName].filter(Boolean).join(" ") || "User";

		await db.insert(users).values({
			id: userId,
			name: name,
			email: email,
			avatarUrl: user.imageUrl || null,
		});

		dbUser = await db.query.users.findFirst({
			where: eq(users.id, userId),
		});
	}

	// Make sure the webhook synced the user before they can onboard
	if (!dbUser) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
					<h2 className="text-xl font-semibold mb-2">
						Syncing your account...
					</h2>
					<p className="text-gray-500">
						Please wait a few seconds and refresh the page. We are
						setting up your profile.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
			<div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
				<div className="mb-8 text-center">
					<h1 className="text-2xl font-bold text-gray-900">
						Welcome, {dbUser.name}!
					</h1>
					<p className="mt-2 text-sm text-gray-600">
						Let&apos;s get your store set up before you start
						exploring or selling.
					</p>
				</div>

				<form action={completeOnboarding} className="space-y-6">
					<div>
						<label
							htmlFor="storeName"
							className="block text-sm font-medium text-gray-700"
						>
							Store Name (Public) *
						</label>
						<div className="mt-1">
							<input
								id="storeName"
								name="storeName"
								type="text"
								required
								placeholder="e.g. PromptMaster99"
								className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
							/>
						</div>
						<p className="mt-2 text-sm text-gray-500">
							This will be your unique handle (e.g.,
							promptmarket.com/store/YourName)
						</p>
					</div>

					<div>
						<label
							htmlFor="bio"
							className="block text-sm font-medium text-gray-700"
						>
							Bio
						</label>
						<div className="mt-1">
							<textarea
								id="bio"
								name="bio"
								rows={3}
								placeholder="Tell the community a bit about yourself..."
								className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
							/>
						</div>
					</div>

					<button
						type="submit"
						className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
					>
						Complete Setup
					</button>
				</form>
			</div>
		</div>
	);
}
