-- Drop the existing table
DROP TABLE IF EXISTS "generated_readme";

-- Recreate the table with the new schema
CREATE TABLE IF NOT EXISTS "generated_readme" (
    "id" varchar(255) NOT NULL PRIMARY KEY,
    "repo_path" varchar(255) NOT NULL,
    "version" integer NOT NULL,
    "content" text NOT NULL,
    "user_id" varchar(255) REFERENCES "user"("id"),
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Create a unique index on repo_path and version
CREATE UNIQUE INDEX "repo_path_version_idx" ON "generated_readme" ("repo_path", "version"); 