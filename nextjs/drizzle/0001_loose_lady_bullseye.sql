CREATE TABLE IF NOT EXISTS "generated_readme" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"repo_path" varchar(255) NOT NULL,
	"name" varchar(255),
	"content" text NOT NULL,
	"user_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint