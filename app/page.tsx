import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import UspWidgets from "@/components/home/usp-widgets"
import { Button } from "@/components/ui/button"
import SignInForm from "@/components/auth/sign-in-form" // Import your existing form

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      redirect("/dashboard")
    }

    // If the user is not authenticated, render the landing page with the sign-in form
    return (
      <div className="min-h-screen bg-background">
        <header className="py-6 md:py-10">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-r from-[#002F71] to-[#0A4BA0] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Viz</span>
              </div>
              <span className="font-bold text-xl tracking-tight">Vizibl</span>
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side: Marketing Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter max-w-4xl mx-auto lg:mx-0">
                All Your Development Tools and Costs.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#002F71] to-[#0A4BA0]">In One Place.</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Manage your subscriptions, track spending, and gain valuable insights into your development stack.
              </p>
              <div className="mt-8 flex justify-center lg:justify-start space-x-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-[#002F71] to-[#0A4BA0] hover:from-[#001f4d] hover:to-[#083d87] text-white">
                  <Link href="#get-started">Get Started</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>

            {/* Right Side: Sign-in Form */}
            <div id="get-started" className="flex items-center justify-center">
              <SignInForm />
            </div>
          </div>
        </main>

        <section id="features" className="py-12 md:py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center">
              Key Features
            </h2>
            <p className="mt-4 text-center text-muted-foreground max-w-xl mx-auto">
              Our platform helps you take control of your development tools with powerful, easy-to-use features.
            </p>
            <div className="mt-12">
              <UspWidgets />
            </div>
          </div>
        </section>

        <footer className="py-6 border-t border-border/40 text-center text-sm text-muted-foreground">
          <div className="container mx-auto px-4">
            &copy; 2025 Vizibl. All rights reserved.
          </div>
        </footer>
      </div>
    );
  } catch (error) {
    // If the auth check fails unexpectedly, we can still render the page
    // as it's a public page. We just won't be able to redirect authenticated users.
    console.error("Auth check failed:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">An error occurred. Please try again later.</p>
      </div>
    );
  }
}
