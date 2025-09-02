// Notification types for the DevStack Companion app

export type NotificationType = 
  | 'renewal_reminder'
  | 'trial_expiring'
  | 'unused_tool'
  | 'cost_alert'

export interface NotificationData {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  isSent: boolean
  relatedId: string | null  // subscription ID
  scheduledFor: Date | null
  sentAt: Date | null
  createdAt: Date
}

export interface SubscriptionForNotification {
  id: string
  userId: string
  toolAccountId: string
  name: string
  cost: number
  currency: string
  billingCycle: 'monthly' | 'yearly' | 'one-time' | 'usage-based'
  status: 'active' | 'trial' | 'cancelled' | 'expired'
  trialEndDate: Date | null
  renewalDate: Date | null
  toolName: string
  userEmail: string
}

export interface NotificationTemplate {
  subject: string
  text: string
  html: string
}

export interface NotificationJob {
  type: NotificationType
  daysAhead: number
  subscriptions: SubscriptionForNotification[]
}

// Email template data
export interface TrialNotificationData {
  toolName: string
  daysUntilExpiry: number
  expiryDate: string
  userEmail: string
}

export interface RenewalNotificationData {
  toolName: string
  daysUntilRenewal: number
  renewalDate: string
  cost: number
  currency: string
  billingCycle: string
  userEmail: string
}

// Response types
export interface NotificationResult {
  success: boolean
  notificationId?: string
  emailId?: string
  error?: string
}

export interface BulkNotificationResult {
  processed: number
  sent: number
  failed: number
  errors: string[]
}
