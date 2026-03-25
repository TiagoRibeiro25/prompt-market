"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateSettings(formData: FormData) {
	const { userId } = await auth();

	if (!userId) {
		throw new Error("Unauthorized");
	}

	const storeName = formData.get("storeName") as string;
	const bio = formData.get("bio") as string;

	if (!storeName || storeName.trim().length === 0) {
		throw new Error("Store name is required");
	}

	try {
		await db
			.update(users)
			.set({
				storeName: storeName.trim(),
				bio: bio ? bio.trim() : null,
			})
			.where(eq(users.id, userId));
	} catch (error: unknown) {
		// Handle unique constraint violation for store_name in Postgres
		if (
			typeof error === "object" &&
			error !== null &&
			"code" in error &&
			(error as { code: string }).code === "23505"
		) {
			throw new Error(
				"Store name is already taken. Please choose another one.",
			);
		}
		throw new Error("Failed to update settings.");
	}

	revalidatePath("/dashboard/settings");
	revalidatePath(`/store/${storeName.trim()}`);
}
