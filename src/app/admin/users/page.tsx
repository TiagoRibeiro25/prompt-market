import { db } from "@/db";
import { users } from "@/db/schema";
import { desc, ne } from "drizzle-orm";
import AdminUserList from "./AdminUserList";
import { auth } from "@clerk/nextjs/server";

export default async function AdminUsersPage() {
	const { userId } = await auth();

	const allUsers = await db
		.select()
		.from(users)
		.where(ne(users.id, userId!))
		.orderBy(desc(users.createdAt));

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-bold text-gray-900 tracking-tight">
					Manage Users
				</h1>
				<p className="text-gray-500 mt-1">
					View, modify roles, or delete users on the platform.
				</p>
			</div>

			<AdminUserList users={allUsers} />
		</div>
	);
}
