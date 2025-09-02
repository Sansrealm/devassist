import { createClient } from "@/lib/supabase/server"
import { NotificationType, NotificationData, SubscriptionForNotification, NotificationResult } from "./types"

/**
 * Get subscriptions with upcoming trial expirations
 */
export async function getUpcomingTrialExpirations(daysAhead: number): Promise<SubscriptionForNotification[]> {
  const supabase = createClient()
  
  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + daysAhead)
  targetDate.setHours(0, 0, 0, 0)
  
  const nextDay = new Date(targetDate)
  nextDay.setDate(nextDay.getDate() + 1)
  
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      id,
      user_id,
      tool_account_id,
      name,
      cost,
      currency,
      billing_cycle,
      status,
      trial_end_date,
      renewal_date,
      tool_accounts!inner (
        tools!inner (
          name
        ),
        emails!inner (
          email
        )
      )
    `)
    .eq('status', 'trial')
    .not('trial_end_date', 'is', null)
    .gte('trial_end_date', targetDate.toISOString())
    .lt('trial_end_date', nextDay.toISOString())
  
  if (error) {
    console.error('Error fetching upcoming trial expirations:', error)
    return []
  }
  
  return data.map(sub => ({
    id: sub.id,
    userId: sub.user_id,
    toolAccountId: sub.tool_account_id,
    name: sub.name,
    cost: Number(sub.cost),
    currency: sub.currency,
    billingCycle: sub.billing_cycle as 'monthly' | 'yearly' | 'one-time' | 'usage-based',
    status: sub.status as 'active' | 'trial' | 'cancelled' | 'expired',
    trialEndDate: sub.trial_end_date ? new Date(sub.trial_end_date) : null,
    renewalDate: sub.renewal_date ? new Date(sub.renewal_date) : null,
    toolName: sub.tool_accounts.tools.name,
    userEmail: sub.tool_accounts.emails.email
  }))
}

/**
 * Get subscriptions with upcoming renewals
 */
export async function getUpcomingRenewals(daysAhead: number): Promise<SubscriptionForNotification[]> {
  const supabase = createClient()
  
  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + daysAhead)
  targetDate.setHours(0, 0, 0, 0)
  
  const nextDay = new Date(targetDate)
  nextDay.setDate(nextDay.getDate() + 1)
  
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      id,
      user_id,
      tool_account_id,
      name,
      cost,
      currency,
      billing_cycle,
      status,
      trial_end_date,
      renewal_date,
      tool_accounts!inner (
        tools!inner (
          name
        ),
        emails!inner (
          email
        )
      )
    `)
    .eq('status', 'active')
    .not('renewal_date', 'is', null)
    .gte('renewal_date', targetDate.toISOString())
    .lt('renewal_date', nextDay.toISOString())
  
  if (error) {
    console.error('Error fetching upcoming renewals:', error)
    return []
  }
  
  return data.map(sub => ({
    id: sub.id,
    userId: sub.user_id,
    toolAccountId: sub.tool_account_id,
    name: sub.name,
    cost: Number(sub.cost),
    currency: sub.currency,
    billingCycle: sub.billing_cycle as 'monthly' | 'yearly' | 'one-time' | 'usage-based',
    status: sub.status as 'active' | 'trial' | 'cancelled' | 'expired',
    trialEndDate: sub.trial_end_date ? new Date(sub.trial_end_date) : null,
    renewalDate: sub.renewal_date ? new Date(sub.renewal_date) : null,
    toolName: sub.tool_accounts.tools.name,
    userEmail: sub.tool_accounts.emails.email
  }))
}

/**
 * Create a notification in the database
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  relatedId: string | null = null,
  scheduledFor: Date | null = null
): Promise<NotificationResult> {
  const supabase = createClient()
  
  // Check if notification already exists to prevent duplicates
  const { data: existing } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', userId)
    .eq('type', type)
    .eq('related_id', relatedId)
    .eq('is_sent', false)
    .single()
  
  if (existing) {
    return {
      success: false,
      error: 'Notification already exists'
    }
  }
  
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      related_id: relatedId,
      scheduled_for: scheduledFor?.toISOString(),
      is_read: false,
      is_sent: false
    })
    .select('id')
    .single()
  
  if (error) {
    console.error('Error creating notification:', error)
    return {
      success: false,
      error: error.message
    }
  }
  
  return {
    success: true,
    notificationId: data.id
  }
}

/**
 * Get pending notifications that need to be sent
 */
export async function getPendingNotifications(): Promise<NotificationData[]> {
  const supabase = createClient()
  
  const now = new Date()
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('is_sent', false)
    .or(`scheduled_for.is.null,scheduled_for.lte.${now.toISOString()}`)
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Error fetching pending notifications:', error)
    return []
  }
  
  return data.map(notification => ({
    id: notification.id,
    userId: notification.user_id,
    type: notification.type as NotificationType,
    title: notification.title,
    message: notification.message,
    isRead: notification.is_read,
    isSent: notification.is_sent,
    relatedId: notification.related_id,
    scheduledFor: notification.scheduled_for ? new Date(notification.scheduled_for) : null,
    sentAt: notification.sent_at ? new Date(notification.sent_at) : null,
    createdAt: new Date(notification.created_at)
  }))
}

/**
 * Mark notification as sent
 */
export async function markNotificationAsSent(notificationId: string): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('notifications')
    .update({
      is_sent: true,
      sent_at: new Date().toISOString()
    })
    .eq('id', notificationId)
  
  if (error) {
    console.error('Error marking notification as sent:', error)
    return false
  }
  
  return true
}

/**
 * Get user's primary email for notifications
 */
export async function getUserPrimaryEmail(userId: string): Promise<string | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('emails')
    .select('email')
    .eq('user_id', userId)
    .eq('is_primary', true)
    .single()
  
  if (error || !data) {
    // Fallback to any email for this user
    const { data: fallback } = await supabase
      .from('emails')
      .select('email')
      .eq('user_id', userId)
      .limit(1)
      .single()
    
    return fallback?.email || null
  }
  
  return data.email
}
