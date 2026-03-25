"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, reviews, prompts } from "@/db/schema";
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

export async function deleteReviewAsAdmin(id: string) {
	await requireAdmin();

	// 1. Fetch the review to get the associated promptId before deleting
	const review = await db.query.reviews.findFirst({
		where: eq(reviews.id, id),
	});

	if (!review) {
		throw new Error("Review not found");
	}

	const promptId = review.promptId;

	// 2. Delete the review
	await db.delete(reviews).where(eq(reviews.id, id));

	// 3. Recalculate average rating for the prompt
	const remainingReviews = await db.query.reviews.findMany({
		where: eq(reviews.promptId, promptId),
	});

	const newAvg =
		remainingReviews.length > 0
			? remainingReviews.reduce((sum, r) => sum + r.rating, 0) /
				remainingReviews.length
			: 0;

	// 4. Update the prompt with the new average rating
	await db
		.update(prompts)
		.set({ averageRating: newAvg.toFixed(2) })
		.where(eq(prompts.id, promptId));

	// 5. Revalidate paths
	revalidatePath("/admin/reviews");

	const prompt = await db.query.prompts.findFirst({
		where: eq(prompts.id, promptId),
	});

	if (prompt) {
		revalidatePath(`/prompt/${prompt.slug}`);
		revalidatePath(`/dashboard/purchases/${prompt.slug}`);
	}
}
