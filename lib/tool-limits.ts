import { createClient } from "@/lib/supabase/server"

export const TOOL_LIMIT = 10

export async function getUserToolCount(userId: string): Promise<number> {
  try {
    const supabase = createClient()
    
    const { count, error } = await supabase
      .from('tools')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) {
      console.error("Error counting user tools:", error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error("Error counting user tools:", error)
    return 0
  }
}

export function hasReachedToolLimit(toolCount: number): boolean {
  return toolCount >= TOOL_LIMIT
}
