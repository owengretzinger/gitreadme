-- Add shortId column to the generated_readme table
ALTER TABLE "generated_readme" ADD COLUMN "short_id" varchar(6) NOT NULL DEFAULT '';

-- Create a compound unique index on repo_path and short_id
CREATE UNIQUE INDEX "repo_path_short_id_idx" ON "generated_readme" ("repo_path", "short_id");

-- Now update existing records to have a unique shortId within each repo
-- Placeholder for actual implementation in the application code

-- After updating existing data, make shortId required
-- ALTER TABLE "generated_readme" ALTER COLUMN "short_id" SET NOT NULL; 