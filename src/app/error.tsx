"use client";

export default function Error() {
	return (
		<div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
			<div className="space-y-2">
				<h2 className="text-2xl font-semibold tracking-tight text-destructive">
					Something went wrong!
				</h2>
				<p className="text-muted-foreground max-w-125">
					An unexpected error occurred while trying to process your
					request.
				</p>
			</div>
			<button
				onClick={() => window.location.reload()}
				className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
			>
				Try again
			</button>
		</div>
	);
}
