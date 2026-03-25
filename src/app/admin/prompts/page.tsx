import { db } from "@/db";
import { prompts, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import AdminPromptList from "./AdminPromptList";

export default async function AdminPromptsPage() {
	// Fetch all prompts on the platform with seller info
	const allPrompts = await db
		.select({
			id: prompts.id,
			title: prompts.title,
			slug: prompts.slug,
			status: prompts.status,
			price: prompts.price,
			createdAt: prompts.createdAt,
			seller: {
				id: users.id,
				name: users.name,
				storeName: users.storeName,
			},
		})
		.from(prompts)
		.innerJoin(users, eq(prompts.sellerId, users.id))
		.orderBy(desc(prompts.createdAt));

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-bold text-gray-900 tracking-tight">
					Manage Prompts
				</h1>
				<p className="text-gray-500 mt-1">
					View, pause, or remove any prompt listed on the marketplace.
				</p>
			</div>

			<AdminPromptList prompts={allPrompts} />
		</div>
	);
}
