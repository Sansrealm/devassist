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

  const lastDate = new Date(lastRenewalDate)
  const today = new Date()
  
  // If last renewal date is invalid, return null
  if (isNaN(lastDate.getTime())) {
    return null
  }

  let nextDate = new Date(lastDate)

  // Keep adding billing periods until we get a future date
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
  
  // Handle edge case: if original date was end of month (e.g., Jan 31)
  // and target month has fewer days (e.g., Feb), set to last day of target month
  if (result.getDate() !== originalDay) {
    result.setDate(0) // Set to last day of previous month (which is target month)
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

  const today = new Date()
  const daysDiff = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  const dateString = nextDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

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
  
  const today = new Date()
  const daysDiff = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  return daysDiff >= 0 && daysDiff <= daysThreshold
}
