import { NextResponse } from "next/server"
import { 
  getUpcomingRenewals, 
  getPendingNotifications, 
  createNotification,
  getUserPrimaryEmail
} from "@/lib/notifications/database"
import { sendNotificationEmail } from "@/lib/notifications/resend"
import { getNotificationContent } from "@/lib/notifications/templates"

export async function GET() {
  console.log("🔍 Starting detailed notification debug...")
  
  try {
    // Step 1: Check upcoming renewals
    const renewals = await getUpcomingRenewals(1)
    console.log("📅 Found renewals:", renewals.length)
    
    if (renewals.length === 0) {
      return NextResponse.json({ message: "No renewals found for tomorrow" })
    }
    
    const subscription = renewals[0]
    console.log("🔍 Processing subscription:", subscription)
    
    // Step 2: Create notification
    const { title, message } = getNotificationContent(
      'renewal_reminder', 
      subscription.toolName, 
      subscription.renewalDate?.toLocaleDateString() || 'Unknown',
      1
    )
    
    console.log("📝 Notification content:", { title, message })
    
    // Step 3: Get user email
    const userEmail = await getUserPrimaryEmail(subscription.userId)
    console.log("📧 User email:", userEmail)
    
    if (!userEmail) {
      return NextResponse.json({ error: "No user email found" })
    }
    
    // Step 4: Try sending email directly
    console.log("🚀 Attempting to send email...")
    const emailResult = await sendNotificationEmail(
      subscription,
      'renewal_reminder',
      userEmail,
      1
    )
    
    console.log("📧 Email result:", emailResult)
    
    return NextResponse.json({
      success: true,
      subscription: {
        toolName: subscription.toolName,
        renewalDate: subscription.renewalDate,
        cost: subscription.cost
      },
      emailResult,
      userEmail
    })
    
  } catch (error) {
    console.error("🔍 Debug error:", error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
  }
}
