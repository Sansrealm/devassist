import { NextResponse } from "next/server"
import { getUpcomingRenewals, getUpcomingTrialExpirations } from "@/lib/notifications/database"

export async function GET() {
  console.log("🔍 Debug: Current time:", new Date().toISOString())
  
  // Test different day ranges
  const results = {
    currentTime: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    renewals: {
      today: await getUpcomingRenewals(0),
      tomorrow: await getUpcomingRenewals(1), 
      dayAfter: await getUpcomingRenewals(2),
    },
    trials: {
      today: await getUpcomingTrialExpirations(0),
      tomorrow: await getUpcomingTrialExpirations(1),
      dayAfter: await getUpcomingTrialExpirations(2),
    }
  }
  
  console.log("🔍 Debug results:", JSON.stringify(results, null, 2))
  
  return NextResponse.json(results)
}
