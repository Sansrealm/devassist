import { NextResponse } from "next/server"
import { detectAndCreateNotifications } from "@/lib/notifications/triggers"

export async function GET() {
  console.log("🔍 Starting notification debug...")
  
  try {
    // Run the actual notification detection process
    const result = await detectAndCreateNotifications()
    
    console.log("🔍 Notification detection result:", JSON.stringify(result, null, 2))
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result: result,
      message: "Check server logs for detailed output"
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
