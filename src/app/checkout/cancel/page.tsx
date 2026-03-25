import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { XCircle, ArrowLeft, Search } from "lucide-react";

export default async function CheckoutCancelPage({
	searchParams,
}: {
	searchParams: Promise<{ slug?: string }>;
}) {
	const params = await searchParams;
	const slug = params?.slug;

	return (
		<div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
			<Navbar />

			<main className="flex-1 flex items-center justify-center p-4">
				<div className="max-w-md w-full bg-white rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-200/40 p-8 md:p-12 text-center">
					<div className="flex justify-center mb-6">
						<div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
							<XCircle className="w-10 h-10 text-red-500" />
						</div>
					</div>

					<h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">
						Checkout Canceled
					</h1>

					<p className="text-gray-600 mb-8 leading-relaxed">
						Your payment was canceled and you have not been charged. If you experienced an issue, you can always try again later.
					</p>

					<div className="space-y-4">
						{slug && (
							<Link
								href={`/prompt/${slug}`}
								className="group flex items-center justify-center gap-2 w-full bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
							>
								<ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
								Return to Prompt
							</Link>
						)}

						<Link
							href="/explore"
							className={`group flex items-center justify-center gap-2 w-full px-6 py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 ${
								slug
									? "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
									: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
							}`}
						>
							{!slug && <Search className="w-5 h-5" />}
							Explore Prompts
						</Link>
					</div>
				</div>
			</main>
		</div>
	);
}
