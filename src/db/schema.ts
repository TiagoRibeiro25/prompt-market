import {
	pgTable,
	text,
	integer,
	boolean,
	timestamp,
	decimal,
	pgEnum,
} from "drizzle-orm/pg-core";

// ---------- ENUMS ----------

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const categoryEnum = pgEnum("category", [
	"chatgpt",
	"midjourney",
	"claude",
	"sora",
	"gemini",
	"stable_diffusion",
	"other",
]);

export const promptStatusEnum = pgEnum("prompt_status", [
	"active",
	"paused",
	"draft",
]);

// ---------- USERS ----------

export const users = pgTable("users", {
	id: text("id").primaryKey(), // Clerk userId
	name: text("name").notNull(), // Pulled from OAuth automatically
	email: text("email").notNull().unique(),
	avatarUrl: text("avatar_url"), // Pulled from OAuth automatically
	role: roleEnum("role").default("user").notNull(),
	storeName: text("store_name").unique(), // Set during onboarding
	bio: text("bio"), // Set during onboarding
	stripeAccountId: text("stripe_account_id"), // Stripe Connect for receiving payouts
	stripeOnboarded: boolean("stripe_onboarded").default(false).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- PROMPTS ----------

export const prompts = pgTable("prompts", {
	id: text("id").primaryKey(), // cuid or uuid
	sellerId: text("seller_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	slug: text("slug").notNull().unique(),
	description: text("description").notNull(),
	teaser: text("teaser").notNull(), // Short preview shown before purchase
	fullPrompt: text("full_prompt").notNull(), // Hidden until purchased or claimed
	price: decimal("price", { precision: 10, scale: 2 }).notNull().default("0"),
	isFree: boolean("is_free").default(false).notNull(),
	category: categoryEnum("category").notNull(),
	tags: text("tags").array(), // e.g. ["portrait", "realistic"]
	status: promptStatusEnum("status").default("active").notNull(),
	totalSales: integer("total_sales").default(0).notNull(),
	averageRating: decimal("average_rating", {
		precision: 3,
		scale: 2,
	}).default("0"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ---------- PURCHASES ----------

export const purchases = pgTable("purchases", {
	id: text("id").primaryKey(),
	buyerId: text("buyer_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	promptId: text("prompt_id")
		.notNull()
		.references(() => prompts.id, { onDelete: "cascade" }),
	stripePaymentId: text("stripe_payment_id"), // null for free prompts
	amountPaid: decimal("amount_paid", { precision: 10, scale: 2 })
		.notNull()
		.default("0"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- REVIEWS ----------

export const reviews = pgTable("reviews", {
	id: text("id").primaryKey(),
	reviewerId: text("reviewer_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	promptId: text("prompt_id")
		.notNull()
		.references(() => prompts.id, { onDelete: "cascade" }),
	rating: integer("rating").notNull(), // 1 to 5
	comment: text("comment"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
