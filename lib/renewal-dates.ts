// lib/renewal-dates.ts

export type BillingCycle = 'monthly' | 'yearly' | 'quarterly' | 'one-time'

/**
 * Calculates the next renewal date based on last renewal date and billing cycle
 */
export function calculateNextRenewalDate(
  lastRenewalDate: string | Date,
  billingCycle: BillingCycle
): Date | null {
  if (billingCycle === 'one-time') {
    return null // One-time payments don't renew
  }

  // Use a UTC-safe date object for calculations
  const lastDate = new Date(lastRenewalDate)
  const today = new Date()
  
  // If last renewal date is invalid, return null
  if (isNaN(lastDate.getTime())) {
    return null
  }

  let nextDate = new Date(lastDate)

  // Keep adding billing periods until we get a future date
  // All comparisons are now UTC-safe
  while (nextDate <= today) {
    switch (billingCycle) {
      case 'monthly':
        nextDate = addMonthsUTC(nextDate, 1)
        break
      case 'quarterly':  
        nextDate = addMonthsUTC(nextDate, 3)
        break
      case 'yearly':
        nextDate = addMonthsUTC(nextDate, 12)
        break
    }
  }

  return nextDate
}

/**
 * Adds months to a date, handling edge cases like month-end dates, using UTC methods
 */
function addMonthsUTC(date: Date, months: number): Date {
  const result = new Date(date)
  const originalDay = result.getUTCDate()
  
  result.setUTCMonth(result.getUTCMonth() + months)
  
  // Handle edge case: if original date was end of month (e.g., Jan 31)
  // and target month has fewer days (e.g., Feb), set to last day of target month
  if (result.getUTCDate() !== originalDay) {
    result.setUTCDate(0) // Set to last day of previous month (which is target month)
  }
  
  return result
}

/**
 * Gets a user-friendly description of the next renewal
 */
export function getRenewalDescription(
  lastRenewalDate: string | Date,
  billingCycle: BillingCycle
): string {
  if (billingCycle === 'one-time') {
    return 'One-time payment (no renewal)'
  }

  const nextDate = calculateNextRenewalDate(lastRenewalDate, billingCycle)
  
  if (!nextDate) {
    return 'Unable to calculate renewal date'
  }
  
  // Create UTC-safe date for today for comparison
  const today = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()))
  const daysDiff = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  // Format the date for display using UTC methods
  const dateString = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(nextDate)

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
  lastRenewalDate: string | Date,
  billingCycle: BillingCycle,
  daysThreshold: number = 7
): boolean {
  const nextDate = calculateNextRenewalDate(lastRenewalDate, billingCycle)
  
  if (!nextDate) return false
  
  const today = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()))
  const daysDiff = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  return daysDiff >= 0 && daysDiff <= daysThreshold
}
