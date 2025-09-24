// lib/renewal-dates.ts
// FIXED: Timezone issue causing dates to shift by 1 day
// Now handles date parsing consistently in local timezone
import { formatDisplayDate } from "@/lib/date"
export type BillingCycle = 'monthly' | 'yearly' | 'quarterly' | 'one-time'

/**
 * Calculates the next renewal date based on stored renewal date and billing cycle
 * If stored date is in future: returns as-is
 * If stored date is in past: calculates next renewal
 */
export function calculateNextRenewalDate(
  renewalDate: string | Date,
  billingCycle: BillingCycle
): Date | null {
  if (billingCycle === 'one-time') {
    return null
  }

  // Parse the stored date - handle both string and Date inputs
  let storedDate: Date
  if (typeof renewalDate === 'string') {
    // For date strings like "2025-09-30", ensure they're parsed as local dates
    if (renewalDate.includes('T')) {
      storedDate = new Date(renewalDate)
    } else {
      // For YYYY-MM-DD format, parse as local date to avoid timezone shifts
      const [year, month, day] = renewalDate.split('-').map(Number)
      storedDate = new Date(year, month - 1, day) // month is 0-indexed
    }
  } else {
    storedDate = new Date(renewalDate)
  }
  
  if (isNaN(storedDate.getTime())) {
    return null
  }

  // Use consistent date comparison (both in local time, date-only)
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset to start of day
  
  const renewalDateOnly = new Date(storedDate)
  renewalDateOnly.setHours(0, 0, 0, 0) // Reset to start of day

  let nextDate = new Date(renewalDateOnly)

  // Only calculate forward if the stored date is in the past
  while (nextDate <= today) {
    switch (billingCycle) {
      case 'monthly':
        nextDate = addMonths(nextDate, 1)
        break
      case 'quarterly':  
        nextDate = addMonths(nextDate, 3)
        break
      case 'yearly':
        nextDate = addMonths(nextDate, 12)
        break
    }
  }

  return nextDate
}

/**
 * Adds months to a date, handling edge cases like month-end dates
 */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  const originalDay = result.getDate()
  
  result.setMonth(result.getMonth() + months)
  
  // Handle month-end edge cases (e.g., Jan 31 + 1 month = Feb 28)
  if (result.getDate() !== originalDay) {
    result.setDate(0) // Go to last day of previous month
  }
  
  return result
}

/**
 * Gets a user-friendly description of the upcoming renewal date
 */
export function getRenewalDescription(
  renewalDate: string | Date,
  billingCycle: BillingCycle
): string {
  if (billingCycle === 'one-time') {
    return 'One-time payment (no renewal)'
  }

  const nextDate = calculateNextRenewalDate(renewalDate, billingCycle)
  
  if (!nextDate) {
    return 'Unable to calculate renewal date'
  }
  
  // Use consistent local time for date comparison
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const nextDateOnly = new Date(nextDate)
  nextDateOnly.setHours(0, 0, 0, 0)
  
  const daysDiff = Math.ceil((nextDateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  const dateString = formatDisplayDate(nextDateUTC)

  if (daysDiff < 0) {
    return `${dateString} (overdue)`
  } else if (daysDiff === 0) {
    return `${dateString} (today)`
  } else if (daysDiff === 1) {
    return `${dateString} (tomorrow)`
  } else if (daysDiff <= 7) {
    return `${dateString} (in ${daysDiff} days)`
  } else {
    return dateString
  }
}

/**
 * Determines if a renewal is coming up soon (within next 7 days)
 */
export function isRenewalUpcoming(
  renewalDate: string | Date,
  billingCycle: BillingCycle,
  daysThreshold: number = 7
): boolean {
  const nextDate = calculateNextRenewalDate(renewalDate, billingCycle)
  
  if (!nextDate) return false
  
  // Use consistent local time for date comparison
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const nextDateOnly = new Date(nextDate)
  nextDateOnly.setHours(0, 0, 0, 0)
  
  const daysDiff = Math.ceil((nextDateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  return daysDiff >= 0 && daysDiff <= daysThreshold
}
