"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { CATEGORIES, STATUSES } from "@/lib/constants";

type PromptData = {
	title?: string;
	description?: string;
	teaser?: string;
	fullPrompt?: string;
	price?: string | null;
	isFree?: boolean;
	category?: string;
	tags?: string[] | null;
	status?: string;
};

type PromptFormProps = {
	action: string | ((formData: FormData) => void);
	initialData?: PromptData;
	buttonText?: string;
};

export default function PromptForm({
	action,
	initialData,
	buttonText = "Save Prompt",
}: PromptFormProps) {
	const [isFree, setIsFree] = useState(initialData?.isFree ?? false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	return (
		<form
			action={(formData) => {
				setIsSubmitting(true);
				if (typeof action === "function") {
					action(formData);
				}
			}}
			className="space-y-8 max-w-4xl"
		>
			<div className="flex items-center justify-between">
				<Link
					href="/dashboard/prompts"
					className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
				>
					<ArrowLeft className="w-4 h-4" />
					Back to Prompts
				</Link>
				<button
					type="submit"
					disabled={isSubmitting}
					className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 shadow-sm transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
				>
					<Save className="w-4 h-4" />
					{isSubmitting ? "Saving..." : buttonText}
				</button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Left Column: Main Details */}
				<div className="lg:col-span-2 space-y-8">
					{/* Basic Info */}
					<div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-6">
						<h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">
							Basic Information
						</h2>

						<div>
							<label
								htmlFor="title"
								className="block text-sm font-semibold text-gray-700 mb-1.5"
							>
								Title *
							</label>
							<input
								type="text"
								id="title"
								name="title"
								required
								defaultValue={initialData?.title}
								placeholder="e.g., Ultra Realistic Portrait Photography"
								className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
							/>
						</div>

						<div>
							<label
								htmlFor="description"
								className="block text-sm font-semibold text-gray-700 mb-1.5"
							>
								Description *
							</label>
							<textarea
								id="description"
								name="description"
								required
								rows={4}
								defaultValue={initialData?.description}
								placeholder="Describe what your prompt does and who it's for..."
								className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-y"
							/>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
							<div>
								<label
									htmlFor="category"
									className="block text-sm font-semibold text-gray-700 mb-1.5"
								>
									Category *
								</label>
								<select
									id="category"
									name="category"
									required
									defaultValue={
										initialData?.category || "chatgpt"
									}
									className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
								>
									{CATEGORIES.map((cat) => (
										<option key={cat} value={cat}>
											{cat
												.replace("_", " ")
												.replace(/\b\w/g, (l) =>
													l.toUpperCase(),
												)}
										</option>
									))}
								</select>
							</div>

							<div>
								<label
									htmlFor="tags"
									className="block text-sm font-semibold text-gray-700 mb-1.5"
								>
									Tags
								</label>
								<input
									type="text"
									id="tags"
									name="tags"
									defaultValue={initialData?.tags?.join(", ")}
									placeholder="portrait, realistic, 8k"
									className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
								/>
								<p className="text-xs text-gray-500 mt-1.5">
									Comma-separated list of keywords.
								</p>
							</div>
						</div>
					</div>

					{/* Prompt Content */}
					<div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-6">
						<h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">
							Prompt Content
						</h2>

						<div>
							<label
								htmlFor="teaser"
								className="block text-sm font-semibold text-gray-700 mb-1.5"
							>
								Teaser (Public) *
							</label>
							<textarea
								id="teaser"
								name="teaser"
								required
								rows={2}
								defaultValue={initialData?.teaser}
								placeholder="A short preview of the prompt structure..."
								className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-y"
							/>
							<p className="text-xs text-gray-500 mt-1.5">
								This is visible to everyone before they
								purchase. Keep the secret sauce hidden!
							</p>
						</div>

						<div>
							<label
								htmlFor="fullPrompt"
								className="block text-sm font-semibold text-gray-700 mb-1.5"
							>
								Full Prompt (Hidden) *
							</label>
							<textarea
								id="fullPrompt"
								name="fullPrompt"
								required
								rows={6}
								defaultValue={initialData?.fullPrompt}
								placeholder="The complete, ready-to-copy prompt goes here..."
								className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-mono text-sm bg-gray-50 resize-y"
							/>
							<p className="text-xs text-gray-500 mt-1.5">
								This is only revealed after a user claims or
								purchases your prompt.
							</p>
						</div>
					</div>
				</div>

				{/* Right Column: Pricing & Status */}
				<div className="space-y-8">
					<div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-6">
						<h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">
							Pricing
						</h2>

						<div className="flex items-center gap-3">
							<input
								type="checkbox"
								id="isFree"
								name="isFree"
								value="true"
								checked={isFree}
								onChange={(e) => setIsFree(e.target.checked)}
								className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
							/>
							<label
								htmlFor="isFree"
								className="text-sm font-semibold text-gray-700 cursor-pointer"
							>
								Make this prompt free
							</label>
						</div>

						{!isFree && (
							<div className="animate-in fade-in slide-in-from-top-2 duration-200">
								<label
									htmlFor="price"
									className="block text-sm font-semibold text-gray-700 mb-1.5"
								>
									Price (USD) *
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<span className="text-gray-500 font-medium">
											$
										</span>
									</div>
									<input
										type="number"
										step="0.01"
										min="0.50"
										id="price"
										name="price"
										required={!isFree}
										defaultValue={
											initialData?.price || "1.00"
										}
										className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
									/>
								</div>
								<p className="text-xs text-gray-500 mt-1.5">
									Minimum price is $0.50 due to transaction
									fees.
								</p>
							</div>
						)}
					</div>

					<div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-6">
						<h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">
							Visibility
						</h2>

						<div>
							<label
								htmlFor="status"
								className="block text-sm font-semibold text-gray-700 mb-1.5"
							>
								Listing Status
							</label>
							<select
								id="status"
								name="status"
								defaultValue={initialData?.status || "draft"}
								className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
							>
								{STATUSES.map((status) => (
									<option key={status} value={status}>
										{status.charAt(0).toUpperCase() +
											status.slice(1)}
									</option>
								))}
							</select>
							<p className="text-xs text-gray-500 mt-2">
								Set to <strong>Active</strong> to publish to the
								marketplace immediately.
							</p>
						</div>
					</div>
				</div>
			</div>
		</form>
	);
}
