DROP INDEX IF EXISTS "repo_path_version_idx";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "repo_path_idx" ON "generated_readme" USING btree ("repo_path");--> statement-breakpoint
ALTER TABLE "generated_readme" DROP COLUMN IF EXISTS "version";