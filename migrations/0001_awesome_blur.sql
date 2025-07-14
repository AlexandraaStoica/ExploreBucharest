CREATE TYPE "public"."main_category" AS ENUM('events', 'activities', 'food&drink', 'nightlife', 'culture');--> statement-breakpoint
CREATE TYPE "public"."sub_category" AS ENUM('festival', 'concert', 'exhibition', 'standup', 'theater', 'film', 'dance', 'meetup', 'museum', 'monument', 'gallery', 'activity');--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "category" TO "sub_category";--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "main_category" "main_category" NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_title_unique" UNIQUE("title");--> statement-breakpoint
DROP TYPE "public"."category";