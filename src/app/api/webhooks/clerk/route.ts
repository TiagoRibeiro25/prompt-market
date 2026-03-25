import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
	// You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
	const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

	if (!WEBHOOK_SECRET) {
		throw new Error(
			"Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
		);
	}

	// Get the headers
	const headerPayload = await headers();
	const svix_id = headerPayload.get("svix-id");
	const svix_timestamp = headerPayload.get("svix-timestamp");
	const svix_signature = headerPayload.get("svix-signature");

	// If there are no headers, error out
	if (!svix_id || !svix_timestamp || !svix_signature) {
		return new Response("Error occured -- no svix headers", {
			status: 400,
		});
	}

	// Get the body
	const payload = await req.text();
	const body = JSON.stringify(JSON.parse(payload));

	// Create a new Svix instance with your secret.
	const wh = new Webhook(WEBHOOK_SECRET);

	let evt: WebhookEvent;

	// Verify the payload with the headers
	try {
		evt = wh.verify(body, {
			"svix-id": svix_id,
			"svix-timestamp": svix_timestamp,
			"svix-signature": svix_signature,
		}) as WebhookEvent;
	} catch (err) {
		console.error("Error verifying webhook:", err);
		return new Response("Error occured", {
			status: 400,
		});
	}

	// Handle the webhook
	const eventType = evt.type;

	if (eventType === "user.created") {
		const { id, first_name, last_name, image_url, email_addresses } =
			evt.data;

		if (!id || !email_addresses || email_addresses.length === 0) {
			return new Response("Error occurred -- missing data", {
				status: 400,
			});
		}

		const email = email_addresses[0].email_address;
		const name =
			[first_name, last_name].filter(Boolean).join(" ") || "User";

		try {
			await db
				.insert(users)
				.values({
					id: id,
					name: name,
					email: email,
					avatarUrl: image_url || null,
				})
				.onConflictDoUpdate({
					target: users.id,
					set: {
						name: name,
						email: email,
						avatarUrl: image_url || null,
					},
				});

			console.log(`User ${id} synced to database`);
		} catch (error) {
			console.error("Error syncing user into database:", error);
			return new Response("Error occurred -- database sync failed", {
				status: 500,
			});
		}
	}

	if (eventType === "user.deleted") {
		const { id } = evt.data;

		if (id) {
			try {
				await db.delete(users).where(eq(users.id, id));
				console.log(`User ${id} deleted from database`);
			} catch (error) {
				console.error("Error deleting user from database:", error);
			}
		}
	}

	return new Response("", { status: 200 });
}
