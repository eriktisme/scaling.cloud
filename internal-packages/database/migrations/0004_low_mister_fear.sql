ALTER TABLE "billing_events" DROP CONSTRAINT "billing_events_provider_account_id_billing_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "billing_events" ALTER COLUMN "provider_account_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "billing_events" ALTER COLUMN "provider_account_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "billing_events" ADD COLUMN "billing_account_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_billing_account_id_billing_accounts_id_fk" FOREIGN KEY ("billing_account_id") REFERENCES "public"."billing_accounts"("id") ON DELETE cascade ON UPDATE no action;