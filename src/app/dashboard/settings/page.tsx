/* eslint-disable @next/next/no-img-element */
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Save, Store, User as UserIcon } from "lucide-react";
import { updateSettings } from "./actions";

export default async function SettingsPage() {
	const { userId } = await auth();

	if (!userId) {
		redirect("/sign-in");
	}

	const dbUser = await db.query.users.findFirst({
		where: eq(users.id, userId),
	});

	if (!dbUser) {
		redirect("/onboarding");
	}

	return (
		<div className="space-y-8 pb-12">
			<div>
				<h1 className="text-2xl font-bold text-gray-900 tracking-tight">
					Settings
				</h1>
				<p className="text-gray-500 mt-1">
					Manage your public store profile and account preferences.
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2">
					<div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
						<div className="p-6 border-b border-gray-100 flex items-center gap-3">
							<Store className="w-5 h-5 text-gray-400" />
							<h2 className="text-lg font-bold text-gray-900">
								Store Profile
							</h2>
						</div>
						<div className="p-6 md:p-8">
							<form action={updateSettings} className="space-y-6">
								<div>
									<label
										htmlFor="storeName"
										className="block text-sm font-semibold text-gray-700 mb-1.5"
									>
										Store Name *
									</label>
									<input
										type="text"
										id="storeName"
										name="storeName"
										required
										defaultValue={dbUser.storeName || ""}
										placeholder="e.g. PromptMaster99"
										className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
									/>
									<p className="text-xs text-gray-500 mt-1.5">
										This is your unique handle and will be
										used for your public store URL.
									</p>
								</div>

								<div>
									<label
										htmlFor="bio"
										className="block text-sm font-semibold text-gray-700 mb-1.5"
									>
										Bio
									</label>
									<textarea
										id="bio"
										name="bio"
										rows={4}
										defaultValue={dbUser.bio || ""}
										placeholder="Tell your customers a little about yourself and your expertise..."
										className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-y"
									/>
									<p className="text-xs text-gray-500 mt-1.5">
										Displayed on your public store page.
										Keep it professional and concise.
									</p>
								</div>

								<div className="pt-4 border-t border-gray-100 flex justify-end">
									<button
										type="submit"
										className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
									>
										<Save className="w-4 h-4" />
										Save Changes
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>

				<div className="lg:col-span-1 space-y-6">
					{/* Account Read-only Info */}
					<div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
						<div className="p-6 border-b border-gray-100 flex items-center gap-3">
							<UserIcon className="w-5 h-5 text-gray-400" />
							<h2 className="text-lg font-bold text-gray-900">
								Account Details
							</h2>
						</div>
						<div className="p-6 space-y-4">
							<div className="flex items-center gap-4 mb-6">
								{dbUser.avatarUrl ? (
									<img
										src={dbUser.avatarUrl}
										alt={dbUser.name}
										className="w-14 h-14 rounded-full border border-gray-200 object-cover"
									/>
								) : (
									<div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl">
										{dbUser.name.charAt(0)}
									</div>
								)}
								<div>
									<p className="font-semibold text-gray-900">
										{dbUser.name}
									</p>
									<p className="text-sm text-gray-500">
										{dbUser.role.charAt(0).toUpperCase() +
											dbUser.role.slice(1)}
									</p>
								</div>
							</div>

							<div>
								<span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
									Email Address
								</span>
								<p className="text-sm font-medium text-gray-900">
									{dbUser.email}
								</p>
							</div>

							<div>
								<span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
									Member Since
								</span>
								<p className="text-sm font-medium text-gray-900">
									{new Date(
										dbUser.createdAt,
									).toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</p>
							</div>

							<div className="pt-4 mt-2 border-t border-gray-100">
								<p className="text-xs text-gray-500 leading-relaxed">
									Your name, email, and avatar are synced
									automatically from your sign-in provider. To
									update them, please manage your account via
									Clerk.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
