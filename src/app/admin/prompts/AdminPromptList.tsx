"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { updatePromptStatusAsAdmin, deletePromptAsAdmin } from "./actions";
import { PromptStatus, STATUSES } from "@/lib/constants";
import { ExternalLink, Trash2, AlertCircle } from "lucide-react";

type AdminPromptData = {
	id: string;
	title: string;
	slug: string;
	status: string;
	price: string;
	createdAt: Date;
	seller: {
		id: string;
		name: string;
		storeName: string | null;
	};
};

export default function AdminPromptList({
	prompts,
}: {
	prompts: AdminPromptData[];
}) {
	const [isPending, startTransition] = useTransition();
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const handleStatusChange = (id: string, newStatus: PromptStatus) => {
		startTransition(async () => {
			try {
				await updatePromptStatusAsAdmin(id, newStatus);
			} catch (error) {
				console.error("Failed to update status", error);
				alert("Failed to update status");
			}
		});
	};

	const handleDelete = (id: string) => {
		if (
			!window.confirm(
				"Are you sure you want to completely delete this prompt? This action cannot be undone.",
			)
		) {
			return;
		}

		setDeletingId(id);
		startTransition(async () => {
			try {
				await deletePromptAsAdmin(id);
			} catch (error) {
				console.error("Failed to delete prompt", error);
				alert("Failed to delete prompt");
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
								Prompt Info
							</th>
							<th className="px-6 py-4 font-semibold">Seller</th>
							<th className="px-6 py-4 font-semibold">Price</th>
							<th className="px-6 py-4 font-semibold">Status</th>
							<th className="px-6 py-4 font-semibold text-right">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{prompts.length > 0 ? (
							prompts.map((prompt) => (
								<tr
									key={prompt.id}
									className={`hover:bg-gray-50/50 transition-colors ${
										isPending
											? "opacity-70 pointer-events-none"
											: ""
									}`}
								>
									<td className="px-6 py-4">
										<div className="font-semibold text-gray-900 truncate max-w-50">
											{prompt.title}
										</div>
										<div className="text-xs text-gray-500 mt-1">
											{new Date(
												prompt.createdAt,
											).toLocaleDateString()}
										</div>
									</td>
									<td className="px-6 py-4">
										<div className="font-medium text-gray-700">
											{prompt.seller.storeName ||
												prompt.seller.name}
										</div>
										<div className="text-xs text-gray-400 mt-0.5 font-mono">
											{prompt.seller.id.slice(0, 12)}...
										</div>
									</td>
									<td className="px-6 py-4 font-medium text-gray-900">
										${prompt.price}
									</td>
									<td className="px-6 py-4">
										<select
											value={prompt.status}
											onChange={(e) =>
												handleStatusChange(
													prompt.id,
													e.target
														.value as PromptStatus,
												)
											}
											disabled={isPending}
											className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer transition-colors ${
												prompt.status === "active"
													? "bg-green-50 text-green-700 border-green-200"
													: prompt.status === "paused"
														? "bg-amber-50 text-amber-700 border-amber-200"
														: "bg-gray-50 text-gray-700 border-gray-200"
											}`}
										>
											{STATUSES.map((status) => (
												<option
													key={status}
													value={status}
												>
													{status
														.charAt(0)
														.toUpperCase() +
														status.slice(1)}
												</option>
											))}
										</select>
									</td>
									<td className="px-6 py-4 text-right">
										<div className="flex items-center justify-end gap-3">
											<Link
												href={`/prompt/${prompt.slug}`}
												target="_blank"
												className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
												title="View Public Page"
											>
												<ExternalLink className="w-4 h-4" />
											</Link>
											<button
												onClick={() =>
													handleDelete(prompt.id)
												}
												disabled={
													isPending ||
													deletingId === prompt.id
												}
												className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
												title="Delete Prompt"
											>
												{deletingId === prompt.id ? (
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
									colSpan={5}
									className="px-6 py-12 text-center"
								>
									<AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
									<p className="text-gray-500 font-medium">
										No prompts found on the platform.
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
