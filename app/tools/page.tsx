// File: app/page.tsx

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import UspWidgets from "@/components/home/usp-widgets"

export default async function HomePage() {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      redirect("/dashboard")
    }

    // If the user is not authenticated, render the landing page
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
            <Button asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter max-w-4xl mx-auto">
            All Your Development Tools and Costs.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#002F71] to-[#0A4BA0]">In One Place.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage your subscriptions, track spending, and gain valuable insights into your development stack.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Button asChild size="lg" className="bg-gradient-to-r from-[#002F71] to-[#0A4BA0] hover:from-[#001f4d] hover:to-[#083d87] text-white">
              <Link href="/sign-in">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#features">Learn More</Link>
            </Button>
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
    console.error("Auth check failed:", error);
    redirect("/sign-in");
  }
}
