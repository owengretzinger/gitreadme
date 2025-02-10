CREATE TABLE IF NOT EXISTS "generation_limit" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"ip_address" varchar(255),
	"user_id" varchar(255),
	"count" integer DEFAULT 1 NOT NULL,
	"date" timestamp with time zone DEFAULT CURRENT_DATE NOT NULL
);
--> statement-breakpoint
ALTER TABLE "generated_readme" DROP CONSTRAINT "generated_readme_repo_path_name_pk";--> statement-breakpoint
ALTER TABLE "generated_readme" ADD COLUMN "version" integer NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "generation_limit" ADD CONSTRAINT "generation_limit_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ip_date_idx" ON "generation_limit" USING btree ("ip_address","date");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_date_idx" ON "generation_limit" USING btree ("user_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "repo_path_version_idx" ON "generated_readme" USING btree ("repo_path","version");--> statement-breakpoint
ALTER TABLE "generated_readme" DROP COLUMN IF EXISTS "name";