ALTER TABLE "users" ALTER COLUMN "hashed_password" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "image" text;
