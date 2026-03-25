import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";

type PromptCardProps = {
	id: string;
	slug: string;
	title: string;
	description: string;
	category: string;
	price: string;
	isFree: boolean;
	totalSales: number;
	averageRating: string;
};

export function PromptCard({
	slug,
	title,
	description,
	category,
	price,
	isFree,
	totalSales,
	averageRating,
}: PromptCardProps) {
	const getCategoryColor = (cat: string) => {
		if (cat === "midjourney" || cat === "stable_diffusion")
			return "bg-pink-50 border-pink-100 text-pink-700";
		if (cat === "chatgpt" || cat === "claude" || cat === "gemini")
			return "bg-blue-50 border-blue-100 text-blue-700";
		return "bg-gray-100 border-gray-200 text-gray-700";
	};

	return (
		<Link
			href={`/prompt/${slug}`}
			className="group flex flex-col bg-white border border-gray-200/80 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 h-full"
		>
			{/* Card Header Pattern */}
			<div className="h-32 w-full bg-gradient-to-br from-indigo-50 to-purple-50 relative overflow-hidden border-b border-gray-100 shrink-0">
				<div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:12px_12px]"></div>
				<div className="absolute bottom-4 left-4 flex gap-2">
					<span
						className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border shadow-sm backdrop-blur-md ${getCategoryColor(
							category,
						)}`}
					>
						{category.replace("_", " ")}
					</span>
				</div>
			</div>

			{/* Card Body */}
			<div className="p-6 flex-1 flex flex-col">
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-1.5 text-sm font-semibold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md">
						<Star className="w-4 h-4 fill-amber-500" />
						{averageRating}
					</div>
					<span className="text-sm font-medium text-gray-400">
						{totalSales} sales
					</span>
				</div>
				<h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-1">
					{title}
				</h3>
				<p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">
					{description}
				</p>

				{/* Card Footer */}
				<div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto shrink-0">
					<span className="text-2xl font-extrabold text-gray-900 tracking-tight">
						{isFree ? (
							<span className="text-green-600">Free</span>
						) : (
							`$${price}`
						)}
					</span>
					<div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 group-hover:bg-indigo-50 group-hover:text-indigo-600 text-gray-400 transition-colors">
						<ArrowRight className="w-5 h-5" />
					</div>
				</div>
			</div>
		</Link>
	);
}
