import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase environment variables are not configured, allow all requests to pass through
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase environment variables not configured. Skipping authentication middleware.")
    return NextResponse.next()
  }

  // Skip middleware for ALL auth routes - let the callback route handle code exchange
  if (request.nextUrl.pathname.startsWith("/auth/")) {
    return NextResponse.next()
  }

  // Skip authentication for cron jobs
  if (request.nextUrl.pathname.startsWith("/api/cron/")) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  try {
    // Only handle user authentication checking, not code exchange
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Protected routes - redirect to sign-in if not authenticated
    const isSignInRoute = request.nextUrl.pathname.startsWith("/sign-in")

    if (!isSignInRoute && !user) {
      const redirectUrl = new URL("/sign-in", request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // If user is authenticated and trying to access sign-in, redirect to dashboard
    if (isSignInRoute && user) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  } catch (error) {
    console.error("Error in middleware auth check:", error)
    // On auth error, allow access to sign-in page
    if (!request.nextUrl.pathname.startsWith("/sign-in")) {
      return NextResponse.redirect(new URL("/sign-in", request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
