"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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

export async function updateUserRoleAsAdmin(id: string, role: "user" | "admin") {
	await requireAdmin();

	await db
		.update(users)
		.set({ role })
		.where(eq(users.id, id));

	revalidatePath("/admin/users");
}

export async function deleteUserAsAdmin(id: string) {
	await requireAdmin();

	// Note: This deletes the user from the local database.
	// Cascading deletes in the schema will handle their prompts, purchases, and reviews.
	// To completely remove their ability to log in, you would also need to delete
	// or ban them via the Clerk API using clerkClient().users.deleteUser(id)
	await db.delete(users).where(eq(users.id, id));

	revalidatePath("/admin/users");
}
