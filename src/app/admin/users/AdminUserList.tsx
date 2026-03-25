/* eslint-disable @next/next/no-img-element */
"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { updateUserRoleAsAdmin, deleteUserAsAdmin } from "./actions";
import { Trash2, AlertCircle, ExternalLink } from "lucide-react";

type AdminUserData = {
	id: string;
	name: string;
	email: string;
	avatarUrl: string | null;
	role: "user" | "admin";
	storeName: string | null;
	stripeOnboarded: boolean;
	createdAt: Date;
};

export default function AdminUserList({ users }: { users: AdminUserData[] }) {
	const [isPending, startTransition] = useTransition();
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const handleRoleChange = (id: string, newRole: "user" | "admin") => {
		startTransition(async () => {
			try {
				await updateUserRoleAsAdmin(id, newRole);
			} catch (error) {
				console.error("Failed to update user role", error);
				alert("Failed to update user role");
			}
		});
	};

	const handleDelete = (id: string) => {
		if (
			!window.confirm(
				"Are you sure you want to completely delete this user? This will remove all their prompts, purchases, and reviews. This action cannot be undone.",
			)
		) {
			return;
		}

		setDeletingId(id);
		startTransition(async () => {
			try {
				await deleteUserAsAdmin(id);
			} catch (error) {
				console.error("Failed to delete user", error);
				alert("Failed to delete user");
			} finally {
				setDeletingId(null);
			}
		});
	};

	return (
		<div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full text-left text-sm whitespace-nowrap">
					<thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500">
						<tr>
							<th className="px-6 py-4 font-semibold">
								User Info
							</th>
							<th className="px-6 py-4 font-semibold">Store</th>
							<th className="px-6 py-4 font-semibold">Role</th>
							<th className="px-6 py-4 font-semibold">
								Stripe Status
							</th>
							<th className="px-6 py-4 font-semibold">Joined</th>
							<th className="px-6 py-4 font-semibold text-right">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{users.length > 0 ? (
							users.map((user) => (
								<tr
									key={user.id}
									className={`hover:bg-gray-50/50 transition-colors ${
										isPending
											? "opacity-70 pointer-events-none"
											: ""
									}`}
								>
									<td className="px-6 py-4">
										<div className="flex items-center gap-3">
											{user.avatarUrl ? (
												<img
													src={user.avatarUrl}
													alt={user.name}
													className="w-10 h-10 rounded-full border border-gray-200 object-cover"
												/>
											) : (
												<div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
													{user.name.charAt(0)}
												</div>
											)}
											<div>
												<div className="font-semibold text-gray-900">
													{user.name}
												</div>
												<div className="text-xs text-gray-500 mt-0.5">
													{user.email}
												</div>
											</div>
										</div>
									</td>
									<td className="px-6 py-4">
										{user.storeName ? (
											<div>
												<div className="font-medium text-gray-700">
													{user.storeName}
												</div>
												<div className="text-xs text-gray-400 mt-0.5 font-mono">
													{user.id.slice(0, 12)}...
												</div>
											</div>
										) : (
											<span className="text-gray-400 italic">
												No store setup
											</span>
										)}
									</td>
									<td className="px-6 py-4">
										<select
											value={user.role}
											onChange={(e) =>
												handleRoleChange(
													user.id,
													e.target.value as
														| "user"
														| "admin",
												)
											}
											disabled={isPending}
											className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer transition-colors ${
												user.role === "admin"
													? "bg-red-50 text-red-700 border-red-200"
													: "bg-gray-50 text-gray-700 border-gray-200"
											}`}
										>
											<option value="user">User</option>
											<option value="admin">Admin</option>
										</select>
									</td>
									<td className="px-6 py-4">
										<span
											className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
												user.stripeOnboarded
													? "bg-green-50 text-green-700"
													: "bg-gray-100 text-gray-600"
											}`}
										>
											{user.stripeOnboarded
												? "Onboarded"
												: "Not Setup"}
										</span>
									</td>
									<td className="px-6 py-4 text-gray-500">
										{new Date(
											user.createdAt,
										).toLocaleDateString()}
									</td>
									<td className="px-6 py-4 text-right">
										<div className="flex items-center justify-end gap-3">
											{user.storeName && (
												<Link
													href={`/store/${user.storeName}`}
													target="_blank"
													className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
													title="View Public Store"
												>
													<ExternalLink className="w-4 h-4" />
												</Link>
											)}
											<button
												onClick={() =>
													handleDelete(user.id)
												}
												disabled={
													isPending ||
													deletingId === user.id
												}
												className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
												title="Delete User"
											>
												{deletingId === user.id ? (
													<span className="w-4 h-4 block rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
												) : (
													<Trash2 className="w-4 h-4" />
												)}
											</button>
										</div>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan={6}
									className="px-6 py-12 text-center"
								>
									<AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
									<p className="text-gray-500 font-medium">
										No users found on the platform.
									</p>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
