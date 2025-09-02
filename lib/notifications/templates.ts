import { NotificationType, NotificationTemplate, TrialNotificationData, RenewalNotificationData } from "./types"

/**
 * Generate trial expiry notification template
 */
export function getTrialExpiryTemplate(data: TrialNotificationData): NotificationTemplate {
  const { toolName, daysUntilExpiry, expiryDate } = data
  
  const isToday = daysUntilExpiry === 0
  const daysText = isToday ? 'today' : daysUntilExpiry === 1 ? 'tomorrow' : `in ${daysUntilExpiry} days`
  
  const subject = isToday 
    ? `🚨 ${toolName} trial expired today`
    : `⏰ ${toolName} trial expires ${daysText}`
  
  const text = `
Your ${toolName} trial expires ${daysText} (${expiryDate}).

${isToday ? 'Your trial has ended and you may lose access to the tool.' : 'Consider upgrading to a paid plan to continue using this tool.'}

Manage your subscriptions: https://vizibl.live/dashboard

Best regards,
DevStack Companion Team
`.trim()

  const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #002F71 0%, #0A4BA0 100%); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">DevStack Companion</h1>
  </div>
  
  <div style="padding: 30px; background: #ffffff;">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="font-size: 48px; margin-bottom: 10px;">⏰</div>
      <h2 style="color: #1a1a1a; margin: 0;">${toolName} Trial ${isToday ? 'Expired' : 'Expiring Soon'}</h2>
    </div>
    
    <div style="background: ${isToday ? '#fee2e2' : '#fef3c7'}; border: 1px solid ${isToday ? '#fca5a5' : '#fcd34d'}; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
      <p style="margin: 0; color: ${isToday ? '#dc2626' : '#d97706'}; font-weight: 600;">
        Your ${toolName} trial ${isToday ? 'has expired' : `expires ${daysText}`} (${expiryDate})
      </p>
      ${isToday ? 
        '<p style="margin: 10px 0 0 0; color: #7c2d12; font-size: 14px;">You may lose access to the tool. Consider upgrading to continue.</p>' : 
        '<p style="margin: 10px 0 0 0; color: #92400e; font-size: 14px;">Consider upgrading to a paid plan to continue using this tool.</p>'
      }
    </div>
    
    <div style="text-align: center; margin-bottom: 30px;">
      <a href="https://vizibl.live/dashboard" 
         style="display: inline-block; background: linear-gradient(135deg, #002F71 0%, #0A4BA0 100%); 
                color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; 
                font-weight: 600; font-size: 16px;">
        Manage Subscriptions
      </a>
    </div>
    
    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
      <p style="color: #6b7280; font-size: 14px; margin: 0;">
        This notification was sent by DevStack Companion to help you track your tool subscriptions.
      </p>
    </div>
  </div>
</div>
`.trim()

  return { subject, text, html }
}

/**
 * Generate renewal notification template
 */
export function getRenewalTemplate(data: RenewalNotificationData): NotificationTemplate {
  const { toolName, daysUntilRenewal, renewalDate, cost, currency, billingCycle } = data
  
  const isToday = daysUntilRenewal === 0
  const daysText = isToday ? 'today' : daysUntilRenewal === 1 ? 'tomorrow' : `in ${daysUntilRenewal} days`
  const costText = `${currency.toUpperCase()} ${cost.toFixed(2)}`
  
  const subject = isToday
    ? `💳 ${toolName} renews today (${costText})`
    : `📅 ${toolName} renews ${daysText} (${costText})`
  
  const text = `
Your ${toolName} subscription renews ${daysText} (${renewalDate}).

Renewal Details:
- Amount: ${costText}
- Billing: ${billingCycle}

${isToday ? 'Your subscription is renewing today.' : 'You have time to make changes if needed.'}

Manage your subscriptions: https://vizibl.live/dashboard

Best regards,
DevStack Companion Team
`.trim()

  const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #002F71 0%, #0A4BA0 100%); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">DevStack Companion</h1>
  </div>
  
  <div style="padding: 30px; background: #ffffff;">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="font-size: 48px; margin-bottom: 10px;">💳</div>
      <h2 style="color: #1a1a1a; margin: 0;">${toolName} ${isToday ? 'Renewing Today' : 'Renewal Reminder'}</h2>
    </div>
    
    <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
      <p style="margin: 0 0 15px 0; color: #0c4a6e; font-weight: 600;">
        Your ${toolName} subscription renews ${daysText} (${renewalDate})
      </p>
      
      <div style="background: white; border-radius: 6px; padding: 15px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px 0; color: #6b7280; font-size: 14px;">Amount:</td>
            <td style="padding: 5px 0; text-align: right; font-weight: 600; color: #1a1a1a;">${costText}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #6b7280; font-size: 14px;">Billing:</td>
            <td style="padding: 5px 0; text-align: right; color: #1a1a1a; text-transform: capitalize;">${billingCycle}</td>
          </tr>
        </table>
      </div>
      
      ${!isToday ? 
        '<p style="margin: 15px 0 0 0; color: #0c4a6e; font-size: 14px;">You have time to make changes if needed.</p>' : 
        '<p style="margin: 15px 0 0 0; color: #0c4a6e; font-size: 14px;">Your subscription is renewing today.</p>'
      }
    </div>
    
    <div style="text-align: center; margin-bottom: 30px;">
      <a href="https://vizibl.live/dashboard" 
         style="display: inline-block; background: linear-gradient(135deg, #002F71 0%, #0A4BA0 100%); 
                color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; 
                font-weight: 600; font-size: 16px;">
        Manage Subscriptions
      </a>
    </div>
    
    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
      <p style="color: #6b7280; font-size: 14px; margin: 0;">
        This notification was sent by DevStack Companion to help you track your tool subscriptions.
      </p>
    </div>
  </div>
</div>
`.trim()

  return { subject, text, html }
}

/**
 * Get template based on notification type
 */
export function getNotificationTemplate(
  type: NotificationType, 
  data: TrialNotificationData | RenewalNotificationData
): NotificationTemplate {
  
  if (type === 'trial_expiring') {
    return getTrialExpiryTemplate(data as TrialNotificationData)
  } else if (type === 'renewal_reminder') {
    return getRenewalTemplate(data as RenewalNotificationData)
  }
  
  throw new Error(`Unknown notification type: ${type}`)
}

/**
 * Generate notification title and message for database storage
 */
export function getNotificationContent(type: NotificationType, toolName: string, date: string, daysUntilEvent?: number) {
  switch (type) {
    case 'trial_expiring':
      if (daysUntilEvent === 0) {
        return {
          title: `${toolName} trial expired`,
          message: `Your ${toolName} trial expired on ${date}. You may lose access to the tool.`
        }
      } else if (daysUntilEvent === 1) {
        return {
          title: `${toolName} trial expires tomorrow`,
          message: `Your ${toolName} trial expires on ${date}. Consider upgrading to continue using this tool.`
        }
      } else {
        return {
          title: `${toolName} trial expires in ${daysUntilEvent} days`,
          message: `Your ${toolName} trial expires on ${date}. Consider upgrading to continue using this tool.`
        }
      }
    
    case 'renewal_reminder':
      if (daysUntilEvent === 0) {
        return {
          title: `${toolName} renews today`,
          message: `Your ${toolName} subscription renews today (${date}).`
        }
      } else if (daysUntilEvent === 1) {
        return {
          title: `${toolName} renews tomorrow`,
          message: `Your ${toolName} subscription renews on ${date}. Last chance to make changes.`
        }
      } else {
        return {
          title: `${toolName} renews in ${daysUntilEvent} days`,
          message: `Your ${toolName} subscription renews on ${date}. Review your usage and make changes if needed.`
        }
      }
    
    case 'unused_tool':
      return {
        title: `Unused tool detected: ${toolName}`,
        message: `${toolName} hasn't been used recently. Consider if you still need this subscription.`
      }
    
    case 'cost_alert':
      return {
        title: `Cost alert for ${toolName}`,
        message: `There's been a cost change for your ${toolName} subscription.`
      }
    
    default:
      return {
        title: `Subscription update for ${toolName}`,
        message: `There's an update regarding your ${toolName} subscription on ${date}.`
      }
  }
}
