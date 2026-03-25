"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, prompts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { PromptStatus } from "@/lib/constants";

// Helper function to verify admin privileges
async function requireAdmin() {
	const { userId } = await auth();

	if (!userId) {
		throw new Error("Unauthorized");
	}

	const user = await db.query.users.findFirst({
		where: eq(users.id, userId),
	});

	if (!user || user.role !== "admin") {
		throw new Error("Forbidden: Admin access required");
	}
}

export async function updatePromptStatusAsAdmin(id: string, status: PromptStatus) {
	await requireAdmin();

	await db
		.update(prompts)
		.set({ status })
		.where(eq(prompts.id, id));

	revalidatePath("/admin/prompts");
}

export async function deletePromptAsAdmin(id: string) {
	await requireAdmin();

	await db.delete(prompts).where(eq(prompts.id, id));

	revalidatePath("/admin/prompts");
}
