import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    // Return empty array if no query or query too short
    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    // Search tool templates by name
    const { data: toolTemplates, error } = await supabase
      .from('tool_templates')
      .select('id, name, description, category, logo_url, website_url, typical_cost, billing_cycle')
      .ilike('name', `%${query}%`)
      .order('name')
      .limit(10)

    if (error) {
      console.error('Tool template search error:', error)
      return NextResponse.json({ error: "Search failed" }, { status: 500 })
    }

    return NextResponse.json(toolTemplates || [])

  } catch (error) {
    console.error('Tool search API error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
