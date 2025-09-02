import { NextRequest, NextResponse } from "next/server"
import { processAllNotifications } from "@/lib/notifications/triggers"

// This endpoint will be called by Vercel Cron
export async function GET(request: NextRequest) {
  // Verify this is actually coming from Vercel Cron (optional security measure)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401 }
    )
  }
  
  console.log('🕒 Cron job started:', new Date().toISOString())
  
  try {
    // Process all notifications (detect + send)
    const result = await processAllNotifications()
    
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      detection: {
        processed: result.detection.processed,
        created: result.detection.sent,
        failed: result.detection.failed,
        errors: result.detection.errors
      },
      sending: {
        processed: result.sending.processed,
        sent: result.sending.sent,
        failed: result.sending.failed,
        errors: result.sending.errors
      },
      summary: {
        totalNotificationsCreated: result.detection.sent,
        totalEmailsSent: result.sending.sent,
        totalErrors: result.detection.failed + result.sending.failed
      }
    }
    
    console.log('✅ Cron job completed successfully:', response.summary)
    
    return NextResponse.json(response, { status: 200 })
    
  } catch (error) {
    console.error('❌ Cron job failed:', error)
    
    const errorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// Handle POST requests (for manual triggers)
export async function POST(request: NextRequest) {
  // This allows manual triggering of notifications (useful for testing)
  
  try {
    const body = await request.json()
    const { action } = body
    
    console.log('🔧 Manual notification trigger:', action)
    
    if (action === 'test') {
      // Just return a test response
      return NextResponse.json({
        success: true,
        message: 'Notification system is ready',
        timestamp: new Date().toISOString()
      })
    }
    
    if (action === 'process') {
      // Run the full notification process
      const result = await processAllNotifications()
      
      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        result
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid action. Use "test" or "process"' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('❌ Manual trigger failed:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
