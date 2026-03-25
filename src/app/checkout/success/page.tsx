import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { CheckCircle, Library, ArrowRight } from "lucide-react";

export default function CheckoutSuccessPage() {
	return (
		<div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
			<Navbar />

			<main className="flex-1 flex items-center justify-center p-4">
				<div className="max-w-md w-full bg-white rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-200/40 p-8 md:p-12 text-center">
					<div className="flex justify-center mb-6">
						<div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
							<CheckCircle className="w-10 h-10 text-green-500" />
						</div>
					</div>

					<h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">
						Payment Successful!
					</h1>

					<p className="text-gray-600 mb-8 leading-relaxed">
						Thank you for your purchase. Your prompt has been
						securely added to your library and is ready to use.
					</p>

					<div className="space-y-4">
						<Link
							href="/dashboard/purchases"
							className="group flex items-center justify-center gap-2 w-full bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
						>
							<Library className="w-5 h-5" />
							Go to My Purchases
						</Link>

						<Link
							href="/explore"
							className="group flex items-center justify-center gap-2 w-full bg-white text-gray-700 px-6 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 border border-gray-200 transition-all active:scale-95"
						>
							Explore More Prompts
							<ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
						</Link>
					</div>
				</div>
			</main>
		</div>
	);
}
