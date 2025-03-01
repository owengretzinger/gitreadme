ALTER TABLE "generated_readme" ADD COLUMN "short_id" varchar(10) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "short_id_idx" ON "generated_readme" USING btree ("short_id");