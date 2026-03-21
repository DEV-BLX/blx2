import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "company",
  "consumer",
  "consultant",
  "content_admin",
  "support_admin",
  "finance_admin",
  "admin",
  "super_admin",
]);

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "suspended",
  "pending_verification",
  "deactivated",
]);

export const companyStatusEnum = pgEnum("company_status", [
  "active",
  "inactive",
  "suspended",
  "draft",
]);

export const importStatusEnum = pgEnum("import_status", [
  "active",
  "inactive",
  "pending_claim",
  "invited",
]);

export const consultantStatusEnum = pgEnum("consultant_status", [
  "active",
  "inactive",
  "suspended",
]);

export const communityStatusEnum = pgEnum("community_status", [
  "active",
  "inactive",
]);

export const taxonomyTypeEnum = pgEnum("taxonomy_type", [
  "company",
  "post",
]);

export const categoryStatusEnum = pgEnum("category_status", [
  "active",
  "inactive",
]);

export const tagStatusEnum = pgEnum("tag_status", [
  "active",
  "inactive",
]);

export const bookingTypeStatusEnum = pgEnum("booking_type_status", [
  "active",
  "inactive",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending_payment",
  "paid",
  "scheduled",
  "completed",
  "cancelled",
  "no_show",
  "disputed",
  "comped",
]);

export const handoffStatusEnum = pgEnum("handoff_status", [
  "pending",
  "complete",
  "incomplete",
]);

export const payoutStatusEnum = pgEnum("payout_status", [
  "unpaid",
  "pending",
  "paid",
  "disputed",
  "adjusted",
]);

export const authorTypeEnum = pgEnum("author_type", [
  "company",
  "consultant",
  "admin",
]);

export const postTypeEnum = pgEnum("post_type", [
  "deal",
  "guide",
  "digital_product",
  "tool",
  "template",
  "resource",
  "blx_content",
]);

export const audienceEnum = pgEnum("audience", [
  "company",
  "consumer",
  "both",
]);

export const paymentModelEnum = pgEnum("payment_model", [
  "stripe",
  "credits",
  "either",
  "free",
]);

export const postStatusEnum = pgEnum("post_status", [
  "draft",
  "pending_review",
  "active",
  "paused",
  "expired",
  "archived",
  "rejected",
]);

export const creditTransactionTypeEnum = pgEnum("credit_transaction_type", [
  "purchase",
  "reward",
  "spend",
  "vote",
  "redemption",
  "refund",
  "expired",
  "admin_adjustment",
  "referral",
  "credit_offer_reward",
]);

export const creditTransactionStatusEnum = pgEnum("credit_transaction_status", [
  "completed",
  "pending",
  "held",
  "reversed",
]);

export const completionRuleEnum = pgEnum("completion_rule", [
  "one_time",
  "repeat_with_cap",
  "repeat_with_cooldown",
  "max_completions",
]);

export const approvalModeEnum = pgEnum("approval_mode", [
  "manual",
  "delayed_auto",
  "rule_based",
]);

export const creditOfferStatusEnum = pgEnum("credit_offer_status", [
  "active",
  "paused",
  "exhausted",
  "expired",
  "archived",
]);

export const proofTypeEnum = pgEnum("proof_type", [
  "text",
  "url",
  "file",
  "image",
  "video",
  "receipt",
  "code",
  "manual_business",
  "admin",
]);

export const completionStatusEnum = pgEnum("completion_status", [
  "accepted",
  "in_progress",
  "submitted",
  "pending_business_review",
  "pending_admin_review",
  "approved",
  "rejected",
  "expired",
  "disputed",
]);

export const echoRequestStatusEnum = pgEnum("echo_request_status", [
  "draft",
  "submitted",
  "open",
  "partially_responded",
  "quoted",
  "closed",
  "expired",
  "cancelled",
]);

export const completionFeeModeEnum = pgEnum("completion_fee_mode", [
  "flat",
  "percentage",
]);

export const jobStatusEnum = pgEnum("job_status", [
  "pending",
  "in_progress",
  "completed",
  "post_award_cancellation",
]);

export const companyBidStatusEnum = pgEnum("company_bid_status", [
  "available",
  "viewed",
  "responded",
  "passed",
  "expired",
  "withdrawn",
]);

export const bidStatusEnum = pgEnum("bid_status", [
  "draft",
  "submitted",
  "updated",
  "accepted",
  "not_selected",
  "withdrawn",
  "expired",
]);

export const echoSenderTypeEnum = pgEnum("echo_sender_type", [
  "consumer",
  "company",
]);

export const purchaseTypeEnum = pgEnum("purchase_type", [
  "subscription",
  "one_time",
  "trial",
]);

export const kitchenItemStatusEnum = pgEnum("kitchen_item_status", [
  "active",
  "inactive",
  "coming_soon",
]);

export const kitchenPurchaseStatusEnum = pgEnum("kitchen_purchase_status", [
  "active",
  "cancelled",
  "expired",
  "trial",
]);

export const savedItemTypeEnum = pgEnum("saved_item_type", [
  "post",
  "company",
  "external",
]);

export const notificationChannelEnum = pgEnum("notification_channel", [
  "in_app",
  "email",
  "sms",
  "slack",
]);

export const settingTypeEnum = pgEnum("setting_type", [
  "integer",
  "decimal",
  "boolean",
  "string",
  "json",
]);

export const referralRewardStatusEnum = pgEnum("referral_reward_status", [
  "pending",
  "qualified",
  "rewarded",
  "voided",
]);
