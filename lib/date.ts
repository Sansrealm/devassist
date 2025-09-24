// lib/date.ts
/**
 * Format a date to "30 Sep 2025" format for consistent, unambiguous display
 * Handles UTC conversion to prevent timezone-related date shifts
 */
export function formatDisplayDate(date: Date | string | null): string {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // Handle invalid dates
  if (isNaN(dateObj.getTime())) return ''
  
  // Extract UTC components to prevent timezone shifts for database dates
  const utcDate = new Date(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate())
  
  return utcDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

/**
 * Format a date to "30 Sep" format (without year) for current year dates
 * Handles UTC conversion to prevent timezone-related date shifts
 */
export function formatDisplayDateShort(date: Date | string | null): string {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // Handle invalid dates
  if (isNaN(dateObj.getTime())) return ''
  
  // Extract UTC components to prevent timezone shifts for database dates
  const utcDate = new Date(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate())
  
  return utcDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short'
  })
}

/**
 * Format date for HTML date inputs (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date | string | null): string {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // Handle invalid dates
  if (isNaN(dateObj.getTime())) return ''
  
  return dateObj.toISOString().split('T')[0]
}

/**
 * Get relative time description (e.g., "in 3 days", "tomorrow", "today")
 */
export function getRelativeTimeDescription(date: Date | string | null): string {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  
  // Handle invalid dates
  if (isNaN(dateObj.getTime())) return ''
  
  // Reset time to midnight for day comparison
  const targetDate = new Date(dateObj)
  targetDate.setHours(0, 0, 0, 0)
  
  const todayMidnight = new Date(today)
  todayMidnight.setHours(0, 0, 0, 0)
  
  const daysDiff = Math.ceil((targetDate.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysDiff === 0) return 'today'
  if (daysDiff === 1) return 'tomorrow'
  if (daysDiff === -1) return 'yesterday'
  if (daysDiff > 0) return `in ${daysDiff} days`
  if (daysDiff < 0) return `${Math.abs(daysDiff)} days ago`
  
  return ''
}// lib/date.ts
/**
 * Format a date to "30 Sep 2025" format for consistent, unambiguous display
 */
export function formatDisplayDate(date: Date | string | null): string {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // Handle invalid dates
  if (isNaN(dateObj.getTime())) return ''
  
  return dateObj.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

/**
 * Format a date to "30 Sep" format (without year) for current year dates
 */
export function formatDisplayDateShort(date: Date | string | null): string {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // Handle invalid dates
  if (isNaN(dateObj.getTime())) return ''
  
  return dateObj.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short'
  })
}

/**
 * Format date for HTML date inputs (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date | string | null): string {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // Handle invalid dates
  if (isNaN(dateObj.getTime())) return ''
  
  return dateObj.toISOString().split('T')[0]
}

/**
 * Get relative time description (e.g., "in 3 days", "tomorrow", "today")
 */
export function getRelativeTimeDescription(date: Date | string | null): string {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  
  // Handle invalid dates
  if (isNaN(dateObj.getTime())) return ''
  
  // Reset time to midnight for day comparison
  const targetDate = new Date(dateObj)
  targetDate.setHours(0, 0, 0, 0)
  
  const todayMidnight = new Date(today)
  todayMidnight.setHours(0, 0, 0, 0)
  
  const daysDiff = Math.ceil((targetDate.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysDiff === 0) return 'today'
  if (daysDiff === 1) return 'tomorrow'
  if (daysDiff === -1) return 'yesterday'
  if (daysDiff > 0) return `in ${daysDiff} days`
  if (daysDiff < 0) return `${Math.abs(daysDiff)} days ago`
  
  return ''
}// lib/utils/date.ts
/**
 * Format a date to "30 Sep 2025" format for consistent, unambiguous display
 */
export function formatDisplayDate(date: Date | string | null): string {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // Handle invalid dates
  if (isNaN(dateObj.getTime())) return ''
  
  return dateObj.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

/**
 * Format a date to "30 Sep" format (without year) for current year dates
 */
export function formatDisplayDateShort(date: Date | string | null): string {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // Handle invalid dates
  if (isNaN(dateObj.getTime())) return ''
  
  return dateObj.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short'
  })
}

/**
 * Format date for HTML date inputs (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date | string | null): string {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // Handle invalid dates
  if (isNaN(dateObj.getTime())) return ''
  
  return dateObj.toISOString().split('T')[0]
}

/**
 * Get relative time description (e.g., "in 3 days", "tomorrow", "today")
 */
export function getRelativeTimeDescription(date: Date | string | null): string {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  
  // Handle invalid dates
  if (isNaN(dateObj.getTime())) return ''
  
  // Reset time to midnight for day comparison
  const targetDate = new Date(dateObj)
  targetDate.setHours(0, 0, 0, 0)
  
  const todayMidnight = new Date(today)
  todayMidnight.setHours(0, 0, 0, 0)
  
  const daysDiff = Math.ceil((targetDate.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysDiff === 0) return 'today'
  if (daysDiff === 1) return 'tomorrow'
  if (daysDiff === -1) return 'yesterday'
  if (daysDiff > 0) return `in ${daysDiff} days`
  if (daysDiff < 0) return `${Math.abs(daysDiff)} days ago`
  
  return ''
}
