export const CATEGORIES = [
	"chatgpt",
	"midjourney",
	"claude",
	"sora",
	"gemini",
	"stable_diffusion",
	"other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const STATUSES = [
	"active",
	"paused",
	"draft",
] as const;

export type PromptStatus = (typeof STATUSES)[number];
