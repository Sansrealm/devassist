import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

// Enhanced viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
  colorScheme: 'light dark',
}

// Enhanced global metadata
export const metadata: Metadata = {
  metadataBase: new URL('https://vizibl.live'),
  title: {
    default: "Vizibl - Your DevStack Companion",
    template: "%s | Vizibl"
  },
  description: "Track your development tools, manage subscriptions, and optimize your dev stack spending. Smart tool management for modern developers.",
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
  generator: "Next.js",
  applicationName: "Vizibl",
  referrer: "origin-when-cross-origin",
  
  // Robots and crawling
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Open Graph (fallback for pages without specific OG tags)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vizibl.live",
    siteName: "Vizibl",
    title: "Vizibl - Your DevStack Companion",
    description: "Track your development tools, manage subscriptions, and optimize your dev stack spending. Smart tool management for modern developers.",
    images: [
      {
        url: "/og-image-default.png", // You'll need to create this
        width: 1200,
        height: 630,
        alt: "Vizibl - Track your development tools and subscriptions",
      }
    ],
  },

  // Twitter fallback
  twitter: {
    card: "summary_large_image",
    site: "@vizibl", // Replace with your actual Twitter handle
    creator: "@vizibl",
  },

  // App icons and manifest
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#002F71' },
    ],
  },
  manifest: '/site.webmanifest',

  // Additional structured metadata
  category: 'productivity',
  classification: 'Business Software',
  
  // Verification (uncomment and add your codes when you have them)
  // verification: {
  //   google: "your-google-verification-code",
  //   yandex: "your-yandex-verification-code",
  //   yahoo: "your-yahoo-verification-code",
  //   other: {
  //     "facebook-domain-verification": "your-facebook-verification-code"
  //   }
  // },

  // Additional metadata
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // App-specific metadata
  other: {
    "application-name": "Vizibl",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Vizibl",
    "msapplication-TileColor": "#002F71",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#002F71",
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
}
        `}</style>
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
