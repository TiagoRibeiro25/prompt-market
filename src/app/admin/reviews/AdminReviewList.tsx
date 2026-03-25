"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { deleteReviewAsAdmin } from "./actions";
import { Trash2, AlertCircle, ExternalLink, Star } from "lucide-react";

type AdminReviewData = {
	id: string;
	rating: number;
	comment: string | null;
	createdAt: Date;
	reviewer: {
		id: string;
		name: string;
	};
	prompt: {
		id: string;
		title: string;
		slug: string;
	};
};

export default function AdminReviewList({
	reviews,
}: {
	reviews: AdminReviewData[];
}) {
	const [isPending, startTransition] = useTransition();
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const handleDelete = (id: string) => {
		if (
			!window.confirm(
				"Are you sure you want to delete this review? This action cannot be undone and the prompt's average rating will be recalculated.",
			)
		) {
			return;
		}

		setDeletingId(id);
		startTransition(async () => {
			try {
				await deleteReviewAsAdmin(id);
			} catch (error) {
				console.error("Failed to delete review", error);
				alert("Failed to delete review");
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
							<th className="px-6 py-4 font-semibold">Review</th>
							<th className="px-6 py-4 font-semibold">
								Reviewer
							</th>
							<th className="px-6 py-4 font-semibold">Prompt</th>
							<th className="px-6 py-4 font-semibold">Date</th>
							<th className="px-6 py-4 font-semibold text-right">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{reviews.length > 0 ? (
							reviews.map((review) => (
								<tr
									key={review.id}
									className={`hover:bg-gray-50/50 transition-colors ${
										isPending
											? "opacity-70 pointer-events-none"
											: ""
									}`}
								>
									<td className="px-6 py-4 whitespace-normal min-w-62.5 max-w-100">
										<div className="flex items-center gap-1 mb-1.5">
											{[...Array(5)].map((_, i) => (
												<Star
													key={i}
													className={`w-3.5 h-3.5 ${
														i < review.rating
															? "text-amber-500 fill-amber-500"
															: "text-gray-300"
													}`}
												/>
											))}
										</div>
										{review.comment ? (
											<p className="text-gray-700 text-sm line-clamp-2 italic">
												&quot;{review.comment}&quot;
											</p>
										) : (
											<span className="text-gray-400 text-xs italic">
												No comment provided
											</span>
										)}
									</td>
									<td className="px-6 py-4">
										<div className="font-medium text-gray-900">
											{review.reviewer.name}
										</div>
										<div className="text-xs text-gray-400 mt-0.5 font-mono">
											{review.reviewer.id.slice(0, 12)}...
										</div>
									</td>
									<td className="px-6 py-4">
										<div className="font-medium text-gray-900 truncate max-w-50">
											{review.prompt.title}
										</div>
										<Link
											href={`/prompt/${review.prompt.slug}`}
											target="_blank"
											className="text-xs text-indigo-600 hover:text-indigo-700 mt-0.5 inline-flex items-center gap-1"
										>
											View Prompt{" "}
											<ExternalLink className="w-3 h-3" />
										</Link>
									</td>
									<td className="px-6 py-4 text-gray-500">
										{new Date(
											review.createdAt,
										).toLocaleDateString()}
									</td>
									<td className="px-6 py-4 text-right">
										<button
											onClick={() =>
												handleDelete(review.id)
											}
											disabled={
												isPending ||
												deletingId === review.id
											}
											className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
											title="Delete Review"
										>
											{deletingId === review.id ? (
												<span className="w-4 h-4 block rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
											) : (
												<Trash2 className="w-4 h-4" />
											)}
										</button>
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
										No reviews found on the platform.
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
