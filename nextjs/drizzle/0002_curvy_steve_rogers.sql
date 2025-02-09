ALTER TABLE "generated_readme" ALTER COLUMN "name" SET DEFAULT 'default';--> statement-breakpoint
ALTER TABLE "generated_readme" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "generated_readme" DROP COLUMN IF EXISTS "hello";