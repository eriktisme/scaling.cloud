CREATE TABLE "billing_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" varchar NOT NULL,
	"provider" varchar NOT NULL,
	"provider_event_id" varchar NOT NULL,
	"provider_account_id" uuid,
	"payload" jsonb NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	CONSTRAINT "billing_events_org_id_provider_provider_event_id_provider_account_id_unique" UNIQUE("org_id","provider","provider_event_id","provider_account_id")
);
--> statement-breakpoint
ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_provider_account_id_billing_accounts_id_fk" FOREIGN KEY ("provider_account_id") REFERENCES "public"."billing_accounts"("id") ON DELETE cascade ON UPDATE no action;