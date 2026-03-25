import { db } from "@/db";
import { reviews, users, prompts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import AdminReviewList from "./AdminReviewList";

export default async function AdminReviewsPage() {
	// Fetch all reviews on the platform with reviewer and prompt info
	const allReviews = await db
		.select({
			id: reviews.id,
			rating: reviews.rating,
			comment: reviews.comment,
			createdAt: reviews.createdAt,
			reviewer: {
				id: users.id,
				name: users.name,
			},
			prompt: {
				id: prompts.id,
				title: prompts.title,
				slug: prompts.slug,
			},
		})
		.from(reviews)
		.innerJoin(users, eq(reviews.reviewerId, users.id))
		.innerJoin(prompts, eq(reviews.promptId, prompts.id))
		.orderBy(desc(reviews.createdAt));

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-bold text-gray-900 tracking-tight">
					Manage Reviews
				</h1>
				<p className="text-gray-500 mt-1">
					Moderate user reviews and ratings across all prompts.
				</p>
			</div>

			<AdminReviewList reviews={allReviews} />
		</div>
	);
}
