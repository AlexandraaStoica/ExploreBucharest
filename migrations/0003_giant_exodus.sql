CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"question" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
