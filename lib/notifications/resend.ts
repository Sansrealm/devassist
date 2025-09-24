import { NotificationTemplate, NotificationResult, SubscriptionForNotification, NotificationType } from "./types"
import { getNotificationTemplate } from "./templates"
import { formatDisplayDate } from "@/lib/date"

/**
 * Send email via Resend API
 */
export async function sendEmail(
  to: string,
  template: NotificationTemplate
): Promise<NotificationResult> {
  const resendApiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL
  
  if (!resendApiKey) {
    console.error('RESEND_API_KEY environment variable is not set')
    return {
      success: false,
      error: 'Resend API key not configured'
    }
  }
  
  if (!fromEmail) {
    console.error('RESEND_FROM_EMAIL environment variable is not set')
    return {
      success: false,
      error: 'From email not configured'
    }
  }
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: template.subject,
        text: template.text,
        html: template.html,
        tags: [
          {
            name: 'type',
            value: 'notification'
          },
          {
            name: 'source',
            value: 'devstack-companion'
          }
        ]
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Resend API error:', errorData)
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}`
      }
    }
    
    const result = await response.json()
    
    return {
      success: true,
      emailId: result.id
    }
    
  } catch (error) {
    console.error('Error sending email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Send trial expiry notification
 */
export async function sendTrialExpiryNotification(
  subscription: SubscriptionForNotification,
  type: NotificationType,
  userEmail: string,
  daysUntilExpiry: number = 0
): Promise<NotificationResult> {
  
  if (!subscription.trialEndDate) {
    return {
      success: false,
      error: 'No trial end date found'
    }
  }
  
  const template = getNotificationTemplate(type, {
    toolName: subscription.toolName,
    daysUntilExpiry,
    expiryDate: formatDisplayDate(subscription.trialEndDate),
    userEmail
  })
  
  return await sendEmail(userEmail, template)
}

/**
 * Send renewal notification
 */
export async function sendRenewalNotification(
  subscription: SubscriptionForNotification,
  type: NotificationType,
  userEmail: string,
  daysUntilRenewal: number = 0
): Promise<NotificationResult> {
  
  if (!subscription.renewalDate) {
    return {
      success: false,
      error: 'No renewal date found'
    }
  }
  
  const template = getNotificationTemplate(type, {
    toolName: subscription.toolName,
    daysUntilRenewal,
    renewalDate: formatDisplayDate(subscription.renewalDate),
    cost: subscription.cost,
    currency: subscription.currency,
    billingCycle: subscription.billingCycle,
    userEmail
  })
  
  return await sendEmail(userEmail, template)
}

/**
 * Send notification based on type
 */
export async function sendNotificationEmail(
  subscription: SubscriptionForNotification,
  type: NotificationType,
  userEmail: string,
  daysUntilEvent: number = 0
): Promise<NotificationResult> {
  
  if (type === 'trial_expiring') {
    return await sendTrialExpiryNotification(subscription, type, userEmail, daysUntilEvent)
  } else if (type === 'renewal_reminder') {
    return await sendRenewalNotification(subscription, type, userEmail, daysUntilEvent)
  }
  
  return {
    success: false,
    error: `Unknown notification type: ${type}`
  }
}

/**
 * Test email sending (useful for debugging)
 */
export async function sendTestEmail(to: string): Promise<NotificationResult> {
  const template: NotificationTemplate = {
    subject: '🧪 DevStack Companion - Test Email',
    text: 'This is a test email to verify your notification system is working correctly.',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #002F71 0%, #0A4BA0 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">DevStack Companion</h1>
        </div>
        
        <div style="padding: 30px; background: #ffffff;">
          <h2 style="color: #1a1a1a;">Test Email Successful! 🎉</h2>
          <p>Your notification system is working correctly. You're ready to receive updates about your tool subscriptions.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://vizibl.live/dashboard" 
               style="display: inline-block; background: linear-gradient(135deg, #002F71 0%, #0A4BA0 100%); 
                      color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; 
                      font-weight: 600; font-size: 16px;">
              Visit Dashboard
            </a>
          </div>
        </div>
      </div>
    `
  }
  
  return await sendEmail(to, template)
}
