import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SignInForm from "@/components/auth/sign-in-form"

export const dynamic = 'force-dynamic'

// Enhanced Open Graph metadata for sign-in page
export const metadata: Metadata = {
  title: "Sign In | Vizibl - Your DevStack Companion",
  description: "Track your development tools, manage subscriptions, and optimize your dev stack spending. Sign in to get started with smart tool management.",
  keywords: [
    "developer tools", 
    "subscription management", 
    "dev stack", 
    "tool tracking", 
    "software subscriptions",
    "development productivity",
    "cost optimization",
    "SaaS management"
  ],
  authors: [{ name: "Vizibl Team" }],
  creator: "Vizibl",
  publisher: "Vizibl",
  robots: "index, follow",
  
  // Open Graph tags
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vizibl.live/sign-in",
    siteName: "Vizibl",
    title: "Sign In | Vizibl - Your DevStack Companion",
    description: "Track your development tools, manage subscriptions, and optimize your dev stack spending. Sign in to get started with smart tool management.",
    images: [
      {
        url: "https://vizibl.live/og-image-sign-in.png",
        width: 1200,
        height: 630,
        alt: "Vizibl - Track your development tools and subscriptions",
        type: "image/png",
      },
      {
        url: "https://vizibl.live/og-image-square.png",
        width: 400,
        height: 400,
        alt: "Vizibl Logo",
        type: "image/png",
      }
    ],
  },

  // Twitter Card tags
  twitter: {
    card: "summary_large_image",
    site: "@vizibl",
    creator: "@vizibl",
    title: "Sign In | Vizibl - Your DevStack Companion",
    description: "Track your development tools, manage subscriptions, and optimize your dev stack spending. Sign in to get started.",
    images: ["https://vizibl.live/og-image-sign-in.png"],
  },

  // Additional metadata
  applicationName: "Vizibl",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // App-specific metadata
  category: "productivity",
  classification: "Business Software",

  // Additional structured data
  other: {
    "application-name": "Vizibl",
    "msapplication-TileColor": "#002F71",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#002F71",
  }
}

export default async function SignInPage() {
  try {
    // Check if user is already logged in
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If user is logged in, redirect to dashboard
    if (session) {
      redirect("/dashboard")
    }
  } catch (error) {
    // If Supabase isn't configured, continue to show sign-in form
    console.warn("Supabase not configured:", error)
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden relative">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Main Container */}
        <div className="relative min-h-screen lg:grid lg:grid-cols-2">
          
          {/* Left Side - Hero Text and Sign In Form */}
          <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 relative z-10">
            <div className="mx-auto w-full max-w-md space-y-8">
              
              {/* Hero Text Section */}
              <div className="text-center lg:text-left mb-12">
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-white leading-none">
                  TRACK AND
                  <br />
                  SAVE ON
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    PRODUCT
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                    SPENDING
                  </span>
                </h1>
                <p className="mt-6 text-lg text-slate-400 max-w-lg">
                  across your projects.
                </p>

                {/* Feature List */}
                <div className="mt-8 space-y-3 text-left">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-400 font-medium">Never miss a renewal again</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-blue-400 font-medium">Get timely renewal reminders</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-purple-400 font-medium">Visualize spending across tools</span>
                  </div>
                </div>
              </div>

              {/* Sign In Form */}
              <div className="space-y-6">
                <SignInForm />
              </div>

              {/* Brand */}
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-[#002F71] to-[#0A4BA0] bg-clip-text text-transparent">
                  Vizibl
                </h2>
              </div>
            </div>
          </div>

          {/* Right Side - Floating UI Elements */}
          <div className="hidden lg:block relative">
            <div className="relative h-full flex items-center justify-center p-8">
              <div className="relative w-full max-w-lg">
                
                {/* Development Tool Card */}
                <div className="absolute top-8 left-8 bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-2xl animate-float">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">development</div>
                      <div className="text-white font-semibold text-lg">$22.00<span className="text-sm text-slate-400">/month</span></div>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>

                {/* Productivity Tool Card - Purple */}
                <div className="absolute top-16 right-12 bg-gradient-to-br from-purple-500/20 to-purple-600/30 backdrop-blur-sm border border-purple-400/30 rounded-xl p-4 shadow-2xl animate-float-delayed">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-purple-300 uppercase tracking-wider font-medium">productivity</div>
                      <div className="text-white font-semibold text-lg">$18.00<span className="text-sm text-purple-200">/month</span></div>
                    </div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  </div>
                </div>

                {/* Development Tool Card - Green */}
                <div className="absolute top-48 left-4 bg-gradient-to-br from-green-500/20 to-green-600/30 backdrop-blur-sm border border-green-400/30 rounded-xl p-4 shadow-2xl animate-float-slow">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-green-300 uppercase tracking-wider font-medium">development</div>
                      <div className="text-white font-semibold text-lg">$10.00<span className="text-sm text-green-200">/month</span></div>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                </div>

                {/* Monthly Spend Card - Main Feature */}
                <div className="absolute top-32 right-8 bg-gradient-to-br from-[#002F71] to-[#0A4BA0] backdrop-blur-sm border border-blue-400/30 rounded-xl p-6 shadow-2xl animate-float-delayed transform rotate-2">
                  <div className="text-center">
                    <div className="text-xs text-blue-200 uppercase tracking-wider font-medium mb-1">Monthly Spend</div>
                    <div className="text-white font-bold text-2xl mb-1">$124.00</div>
                    <div className="text-xs text-green-300 font-medium">Save $61/mo</div>
                    <div className="text-xs text-blue-200 mt-1">8 Active Tools</div>
                  </div>
                </div>

                {/* Productivity Tool Card - Blue Bottom */}
                <div className="absolute bottom-24 left-16 bg-gradient-to-br from-blue-500/20 to-blue-600/30 backdrop-blur-sm border border-blue-400/30 rounded-xl p-4 shadow-2xl animate-float">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-blue-300 uppercase tracking-wider font-medium">productivity</div>
                      <div className="text-white font-semibold text-lg">$10.00<span className="text-sm text-blue-200">/month</span></div>
                    </div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Floating Elements */}
          <div className="lg:hidden relative px-4 pb-8">
            <div className="relative max-w-sm mx-auto h-40">
              <div className="absolute top-0 left-4 bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3 shadow-xl">
                <div className="text-xs text-slate-400">development</div>
                <div className="text-white font-semibold">$22.00<span className="text-xs text-slate-400">/month</span></div>
              </div>
              
              <div className="absolute top-4 right-8 bg-gradient-to-br from-[#002F71] to-[#0A4BA0] backdrop-blur-sm border border-blue-400/30 rounded-lg p-3 shadow-xl">
                <div className="text-xs text-blue-200">Monthly Spend</div>
                <div className="text-white font-bold text-lg">$124.00</div>
              </div>

              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-green-500/20 to-green-600/30 backdrop-blur-sm border border-green-400/30 rounded-lg p-3 shadow-xl">
                <div className="text-xs text-green-300">Save $61/mo</div>
                <div className="text-white font-semibold">8 Active Tools</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(2deg); }
          50% { transform: translateY(-15px) rotate(1deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-8px) rotate(0deg); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite 2s;
        }
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite 1s;
        }
      `}</style>
    </>
  )
}
