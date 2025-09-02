import { NextResponse } from "next/server"
import { sendTestEmail } from "@/lib/notifications/resend"

export async function GET() {
  console.log("Testing email sending...")
  
  // Test environment variables
  const hasApiKey = !!process.env.RESEND_API_KEY
  const hasFromEmail = !!process.env.RESEND_FROM_EMAIL
  
  console.log("Environment check:", {
    hasApiKey,
    hasFromEmail,
    fromEmail: process.env.RESEND_FROM_EMAIL
  })
  
  if (!hasApiKey || !hasFromEmail) {
    return NextResponse.json({
      success: false,
      error: "Missing environment variables",
      hasApiKey,
      hasFromEmail
    })
  }
  
  // Test sending email
  try {
    const result = await sendTestEmail("nair.sanjeev@gmail.com")
    console.log("Email test result:", result)
    
    return NextResponse.json({
      success: true,
      emailResult: result,
      env: {
        hasApiKey,
        fromEmail: process.env.RESEND_FROM_EMAIL
      }
    })
  } catch (error) {
    console.error("Email test error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
