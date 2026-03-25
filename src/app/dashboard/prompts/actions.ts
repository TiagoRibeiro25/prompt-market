"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { prompts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Category, PromptStatus } from "@/lib/constants";

// Helper to generate a unique slug
function generateSlug(title: string) {
	const base = title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)+/g, "");
	const suffix = Math.random().toString(36).substring(2, 8);
	return `${base}-${suffix}`;
}

export async function createPrompt(formData: FormData) {
	const { userId } = await auth();

	if (!userId) {
		throw new Error("Unauthorized");
	}

	const title = formData.get("title") as string;
	const description = formData.get("description") as string;
	const teaser = formData.get("teaser") as string;
	const fullPrompt = formData.get("fullPrompt") as string;
	const price = formData.get("price") as string;
	const isFree = formData.get("isFree") === "true";
	const category = formData.get("category") as Category;
	const tagsString = formData.get("tags") as string;
	const status = formData.get("status") as PromptStatus;

	const tags = tagsString
		? tagsString
				.split(",")
				.map((t) => t.trim())
				.filter(Boolean)
		: [];

	const id = crypto.randomUUID();
	const slug = generateSlug(title);

	await db.insert(prompts).values({
		id,
		sellerId: userId,
		title,
		slug,
		description,
		teaser,
		fullPrompt,
		price: isFree ? "0" : price || "0",
		isFree,
		category,
		tags,
		status: status || "draft",
	});

	revalidatePath("/dashboard/prompts");
	redirect("/dashboard/prompts");
}

export async function updatePrompt(id: string, formData: FormData) {
	const { userId } = await auth();

	if (!userId) {
		throw new Error("Unauthorized");
	}

	const title = formData.get("title") as string;
	const description = formData.get("description") as string;
	const teaser = formData.get("teaser") as string;
	const fullPrompt = formData.get("fullPrompt") as string;
	const price = formData.get("price") as string;
	const isFree = formData.get("isFree") === "true";
	const category = formData.get("category") as Category;
	const tagsString = formData.get("tags") as string;
	const status = formData.get("status") as PromptStatus;

	const tags = tagsString
		? tagsString
				.split(",")
				.map((t) => t.trim())
				.filter(Boolean)
		: [];

	await db
		.update(prompts)
		.set({
			title,
			description,
			teaser,
			fullPrompt,
			price: isFree ? "0" : price || "0",
			isFree,
			category,
			tags,
			status: status || "draft",
			updatedAt: new Date(),
		})
		.where(and(eq(prompts.id, id), eq(prompts.sellerId, userId)));

	revalidatePath("/dashboard/prompts");
	redirect("/dashboard/prompts");
}

export async function deletePrompt(id: string) {
	const { userId } = await auth();

	if (!userId) {
		throw new Error("Unauthorized");
	}

	await db
		.delete(prompts)
		.where(and(eq(prompts.id, id), eq(prompts.sellerId, userId)));

	revalidatePath("/dashboard/prompts");
}
