ALTER TABLE "products" ADD COLUMN "image_urls" text;
UPDATE "products" SET "image_urls" = "image_url" WHERE "image_url" IS NOT NULL;
ALTER TABLE "products" DROP COLUMN "image_url";
