import Link from "next/link";

export default function NotFound() {
	return (
		<div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
			<div className="space-y-2">
				<h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
					404
				</h1>
				<h2 className="text-2xl font-semibold tracking-tight">
					Page Not Found
				</h2>
			</div>
			<p className="text-muted-foreground max-w-125">
				Sorry, we couldn&apos;t find the page you&apos;re looking for.
				The page might have been removed, had its name changed, or is
				temporarily unavailable.
			</p>
			<Link
				href="/"
				className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
			>
				Return Home
			</Link>
		</div>
	);
}
