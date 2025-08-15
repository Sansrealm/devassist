import { pgTable, text, timestamp, uuid, integer, boolean, decimal, pgEnum } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// Enums
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "cancelled", "expired", "trial"])
export const subscriptionTypeEnum = pgEnum("subscription_type", ["monthly", "yearly", "one-time", "usage-based"])
export const projectStatusEnum = pgEnum("project_status", ["active", "paused", "completed", "archived"])
export const toolCategoryEnum = pgEnum("tool_category", [
  "development",
  "design",
  "productivity",
  "communication",
  "analytics",
  "marketing",
  "other",
])
export const activityTypeEnum = pgEnum("activity_type", [
  "tool_added",
  "tool_removed",
  "subscription_created",
  "subscription_cancelled",
  "project_created",
  "project_updated",
])
export const notificationTypeEnum = pgEnum("notification_type", [
  "renewal_reminder",
  "trial_expiring",
  "unused_tool",
  "cost_alert",
])

// Profiles table
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").notNull(), // Supabase auth.users.id
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatarUrl: text("avatar_url"),
  timezone: text("timezone").default("UTC"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Emails table
export const emails = pgTable("emails", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  email: text("email").notNull(),
  isPrimary: boolean("is_primary").default(false),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Projects table
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: projectStatusEnum("status").default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Tools table
export const tools = pgTable("tools", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  category: toolCategoryEnum("category").default("other"),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  baseCost: decimal("base_cost", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Tool accounts table (links tools to specific email accounts)
export const toolAccounts = pgTable("tool_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  toolId: uuid("tool_id").notNull(),
  emailId: uuid("email_id").notNull(),
  accountName: text("account_name"),
  accountUrl: text("account_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  toolAccountId: uuid("tool_account_id").notNull(),
  name: text("name").notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD"),
  billingCycle: subscriptionTypeEnum("billing_cycle").notNull(),
  status: subscriptionStatusEnum("status").default("active"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  renewalDate: timestamp("renewal_date"),
  trialEndDate: timestamp("trial_end_date"),
  isAutoRenew: boolean("is_auto_renew").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Project tools mapping table
export const projectTools = pgTable("project_tools", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  projectId: uuid("project_id").notNull(),
  toolAccountId: uuid("tool_account_id").notNull(),
  isActive: boolean("is_active").default(true),
  lastUsed: timestamp("last_used"),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Activity log table
export const activity = pgTable("activity", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  type: activityTypeEnum("type").notNull(),
  description: text("description").notNull(),
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Notifications table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  isSent: boolean("is_sent").default(false),
  relatedId: uuid("related_id"), // Can reference tool, subscription, etc.
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Relations
export const profilesRelations = relations(profiles, ({ many }) => ({
  emails: many(emails),
  projects: many(projects),
  tools: many(tools),
  toolAccounts: many(toolAccounts),
  subscriptions: many(subscriptions),
  projectTools: many(projectTools),
  activity: many(activity),
  notifications: many(notifications),
}))

export const emailsRelations = relations(emails, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [emails.userId],
    references: [profiles.id],
  }),
  toolAccounts: many(toolAccounts),
}))

export const projectsRelations = relations(projects, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [projects.userId],
    references: [profiles.id],
  }),
  projectTools: many(projectTools),
}))

export const toolsRelations = relations(tools, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [tools.userId],
    references: [profiles.id],
  }),
  toolAccounts: many(toolAccounts),
}))

export const toolAccountsRelations = relations(toolAccounts, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [toolAccounts.userId],
    references: [profiles.id],
  }),
  tool: one(tools, {
    fields: [toolAccounts.toolId],
    references: [tools.id],
  }),
  email: one(emails, {
    fields: [toolAccounts.emailId],
    references: [emails.id],
  }),
  subscriptions: many(subscriptions),
  projectTools: many(projectTools),
}))

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  profile: one(profiles, {
    fields: [subscriptions.userId],
    references: [profiles.id],
  }),
  toolAccount: one(toolAccounts, {
    fields: [subscriptions.toolAccountId],
    references: [toolAccounts.id],
  }),
}))

export const projectToolsRelations = relations(projectTools, ({ one }) => ({
  profile: one(profiles, {
    fields: [projectTools.userId],
    references: [profiles.id],
  }),
  project: one(projects, {
    fields: [projectTools.projectId],
    references: [projects.id],
  }),
  toolAccount: one(toolAccounts, {
    fields: [projectTools.toolAccountId],
    references: [toolAccounts.id],
  }),
}))

export const activityRelations = relations(activity, ({ one }) => ({
  profile: one(profiles, {
    fields: [activity.userId],
    references: [profiles.id],
  }),
}))

export const notificationsRelations = relations(notifications, ({ one }) => ({
  profile: one(profiles, {
    fields: [notifications.userId],
    references: [profiles.id],
  }),
}))
