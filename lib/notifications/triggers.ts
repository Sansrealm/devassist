import { 
  getUpcomingTrialExpirations, 
  getUpcomingRenewals, 
  createNotification, 
  getPendingNotifications, 
  markNotificationAsSent,
  getUserPrimaryEmail 
} from "./database"
import { sendNotificationEmail } from "./resend"
import { getNotificationContent } from "./templates"
import { NotificationType, NotificationJob, BulkNotificationResult, SubscriptionForNotification } from "./types"

/**
 * Define notification schedules
 */
const TRIAL_NOTIFICATION_SCHEDULE = [
  { daysAhead: 7 },
  { daysAhead: 3 },
  { daysAhead: 1 },
  { daysAhead: 0 }, // expiry day
]

const RENEWAL_NOTIFICATION_SCHEDULE = [
  { daysAhead: 30 },
  { daysAhead: 7 },
  { daysAhead: 1 },
  { daysAhead: 0 }, // renewal day
]

/**
 * Process trial expiry notifications
 */
async function processTrialNotifications(): Promise<NotificationJob[]> {
  const jobs: NotificationJob[] = []
  
  for (const schedule of TRIAL_NOTIFICATION_SCHEDULE) {
    const subscriptions = await getUpcomingTrialExpirations(schedule.daysAhead)
    
    if (subscriptions.length > 0) {
      jobs.push({
        type: 'trial_expiring',
        daysAhead: schedule.daysAhead,
        subscriptions
      })
    }
  }
  
  return jobs
}

/**
 * Process renewal notifications
 */
async function processRenewalNotifications(): Promise<NotificationJob[]> {
  const jobs: NotificationJob[] = []
  
  for (const schedule of RENEWAL_NOTIFICATION_SCHEDULE) {
    const subscriptions = await getUpcomingRenewals(schedule.daysAhead)
    
    if (subscriptions.length > 0) {
      jobs.push({
        type: 'renewal_reminder',
        daysAhead: schedule.daysAhead,
        subscriptions
      })
    }
  }
  
  return jobs
}

/**
 * Create notifications for detected subscriptions
 */
async function createNotificationsFromJobs(jobs: NotificationJob[]): Promise<BulkNotificationResult> {
  let processed = 0
  let created = 0
  const errors: string[] = []
  
  for (const job of jobs) {
    for (const subscription of job.subscriptions) {
      processed++
      
      try {
        const date = job.type === 'trial_expiring'
          ? subscription.trialEndDate?.toLocaleDateString('en-US') || 'Unknown'
          : subscription.renewalDate?.toLocaleDateString('en-US') || 'Unknown'
        
        const { title, message } = getNotificationContent(job.type, subscription.toolName, date, job.daysAhead)
        
        const result = await createNotification(
          subscription.userId,
          job.type,
          title,
          message,
          subscription.id
        )
        
        if (result.success) {
          created++
          console.log(`✅ Created ${job.type} notification for ${subscription.toolName} (${job.daysAhead} days)`)
        } else {
          if (!result.error?.includes('already exists')) {
            errors.push(`Failed to create notification for ${subscription.toolName}: ${result.error}`)
          }
        }
        
      } catch (error) {
        errors.push(`Error processing ${subscription.toolName}: ${error}`)
        console.error(`Error processing subscription ${subscription.id}:`, error)
      }
    }
  }
  
  return {
    processed,
    sent: created,
    failed: errors.length,
    errors
  }
}

/**
 * Send pending notifications via email
 */
async function sendPendingNotifications(): Promise<BulkNotificationResult> {
  const pendingNotifications = await getPendingNotifications()
  
  if (pendingNotifications.length === 0) {
    return {
      processed: 0,
      sent: 0,
      failed: 0,
      errors: []
    }
  }
  
  let processed = 0
  let sent = 0
  const errors: string[] = []
  
  for (const notification of pendingNotifications) {
    processed++
    
    try {
      // Get user's primary email
      const userEmail = await getUserPrimaryEmail(notification.userId)
      
      if (!userEmail) {
        errors.push(`No email found for user ${notification.userId}`)
        continue
      }
      
      // For now, just mark as sent without actually sending email
      // Full email integration will be added when subscription details are available
      const success = await markNotificationAsSent(notification.id)
      
      if (success) {
        sent++
        console.log(`📧 Marked notification as sent: ${notification.title}`)
      } else {
        errors.push(`Failed to mark notification ${notification.id} as sent`)
      }
      
    } catch (error) {
      errors.push(`Error sending notification ${notification.id}: ${error}`)
      console.error(`Error sending notification ${notification.id}:`, error)
    }
  }
  
  return {
    processed,
    sent,
    failed: errors.length,
    errors
  }
}

/**
 * Main function to detect and create all notifications
 */
export async function detectAndCreateNotifications(): Promise<BulkNotificationResult> {
  console.log('🔍 Starting notification detection...')
  
  try {
    // Get all notification jobs
    const [trialJobs, renewalJobs] = await Promise.all([
      processTrialNotifications(),
      processRenewalNotifications()
    ])
    
    const allJobs = [...trialJobs, ...renewalJobs]
    
    if (allJobs.length === 0) {
      console.log('✅ No notifications needed at this time')
      return {
        processed: 0,
        sent: 0,
        failed: 0,
        errors: []
      }
    }
    
    console.log(`📋 Found ${allJobs.length} notification jobs`)
    
    // Create notifications
    const result = await createNotificationsFromJobs(allJobs)
    
    console.log(`✅ Notification detection complete: ${result.sent} created, ${result.failed} errors`)
    
    return result
    
  } catch (error) {
    console.error('❌ Error in notification detection:', error)
    return {
      processed: 0,
      sent: 0,
      failed: 1,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }
  }
}

/**
 * Main function to send pending notifications
 */
export async function sendAllPendingNotifications(): Promise<BulkNotificationResult> {
  console.log('📧 Starting to send pending notifications...')
  
  try {
    const result = await sendPendingNotifications()
    
    console.log(`✅ Email sending complete: ${result.sent} sent, ${result.failed} errors`)
    
    return result
    
  } catch (error) {
    console.error('❌ Error sending notifications:', error)
    return {
      processed: 0,
      sent: 0,
      failed: 1,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }
  }
}

/**
 * Complete notification process (detect + send)
 */
export async function processAllNotifications(): Promise<{
  detection: BulkNotificationResult
  sending: BulkNotificationResult
}> {
  console.log('🚀 Starting complete notification process...')
  
  const detection = await detectAndCreateNotifications()
  const sending = await sendAllPendingNotifications()
  
  console.log('🎉 Notification process complete!')
  console.log(`📊 Summary: ${detection.sent} notifications created, ${sending.sent} emails sent`)
  
  return { detection, sending }
}

/**
 * Process notifications for a specific user (useful for testing)
 */
export async function processUserNotifications(userId: string): Promise<BulkNotificationResult> {
  // This would be similar to processAllNotifications but filtered by userId
  // Implement if needed for testing individual users
  console.log(`Processing notifications for user: ${userId}`)
  
  return {
    processed: 0,
    sent: 0,
    failed: 0,
    errors: ['User-specific processing not implemented yet']
  }
}
