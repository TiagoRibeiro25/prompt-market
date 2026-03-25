import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createPrompt } from "../actions";
import PromptForm from "../components/PromptForm";

export default async function NewPromptPage() {
	const { userId } = await auth();

	if (!userId) {
		redirect("/sign-in");
	}

	return (
		<div className="space-y-8 pb-12">
			<div>
				<h1 className="text-2xl font-bold text-gray-900 tracking-tight">
					Create New Prompt
				</h1>
				<p className="text-gray-500 mt-1">
					Fill out the details below to list your prompt on the
					marketplace.
				</p>
			</div>

			<PromptForm action={createPrompt} buttonText="Publish Prompt" />
		</div>
	);
}
