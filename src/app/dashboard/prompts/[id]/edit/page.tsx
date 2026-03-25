import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { prompts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { updatePrompt } from "../../actions";
import PromptForm from "../../components/PromptForm";

export default async function EditPromptPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { userId } = await auth();

	if (!userId) {
		redirect("/sign-in");
	}

	const { id } = await params;

	const prompt = await db.query.prompts.findFirst({
		where: and(eq(prompts.id, id), eq(prompts.sellerId, userId)),
	});

	if (!prompt) {
		notFound();
	}

	// Bind the ID to the server action so it knows which prompt to update
	const updatePromptWithId = updatePrompt.bind(null, id);

	return (
		<div className="space-y-8 pb-12">
			<div>
				<h1 className="text-2xl font-bold text-gray-900 tracking-tight">
					Edit Prompt
				</h1>
				<p className="text-gray-500 mt-1">
					Update your prompt details, pricing, and visibility.
				</p>
			</div>

			<PromptForm
				action={updatePromptWithId}
				initialData={prompt}
				buttonText="Save Changes"
			/>
		</div>
	);
}
