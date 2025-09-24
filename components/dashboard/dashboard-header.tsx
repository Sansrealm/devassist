"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, Plus, Menu, Moon, Sun, Rocket } from "lucide-react"
import { signOut } from "@/lib/auth/actions"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import Link from "next/link"
import BetaSignupModal from "@/components/beta/beta-signup-modal"
import { hasReachedToolLimit } from "@/lib/tool-limits"

interface DashboardHeaderProps {
  user: {
    id: string
    email?: string
    user_metadata?: {
      avatar_url?: string
      full_name?: string
    }
  }
  toolCount?: number
  isBetaReady?: boolean
}

export default function DashboardHeader({ user, toolCount = 0, isBetaReady = false }: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [betaModalOpen, setBetaModalOpen] = useState(false)
  const userInitials = user.email?.charAt(0).toUpperCase() || "U"

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Tools', href: '/tools' },
    { name: 'Projects', href: '/projects' },
    { name: 'Mapping', href: '/map' },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  // Determine which button to show
  const showBetaButton = hasReachedToolLimit(toolCount) && !isBetaReady
  const showAddToolButton = !hasReachedToolLimit(toolCount)

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div className="h-8 w-8 bg-gradient-to-r from-[#002F71] to-[#0A4BA0] rounded-lg flex items-center justify-center shadow-[var(--shadow-soft)]">
                  <span className="text-white font-bold text-sm">Viz</span>
                </div>
                <div className="hidden sm:block">
                  <span className="font-bold text-xl tracking-tight">Vizibl</span>
                  <p className="text-xs text-muted-foreground">Development tool management</p>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-1">
                {navigation.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-muted/80 ${
                        active 
                          ? 'bg-muted text-foreground shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Add Tool or Beta Button */}
              {showAddToolButton && (
                <Button 
                  size="sm" 
                  asChild 
                  className="bg-gradient-to-r from-[#002F71] to-[#0A4BA0] hover:from-[#001f4d] hover:to-[#083d87] text-white shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] transition-all duration-200"
                >
                  <Link href="/tools/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tool
                  </Link>
                </Button>
              )}

              {showBetaButton && (
                <Button 
                  size="sm" 
                  onClick={() => setBetaModalOpen(true)}
                  className="bg-gradient-to-r from-[#002F71] to-[#0A4BA0] hover:from-[#001f4d] hover:to-[#083d87] text-white shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] transition-all duration-200"
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Register for Beta
                </Button>
              )}

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-9 w-9 hover:bg-muted/80 transition-colors"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-muted/80 transition-colors">
                    <Avatar className="h-8 w-8 shadow-[var(--shadow-soft)]">
                      <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} alt={user.email} />
                      <AvatarFallback className="bg-muted font-medium text-sm">{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 animate-in slide-in-from-top-2" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.user_metadata?.full_name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <form action={signOut}>
                      <button type="submit" className="flex w-full items-center cursor-pointer text-destructive focus:text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9 hover:bg-muted/80 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden animate-in slide-in-from-top-2">
              <div className="border-t border-border/40 pt-4 pb-4 space-y-1">
                {navigation.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        active 
                          ? 'bg-muted text-foreground' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Beta Signup Modal */}
      <BetaSignupModal 
        open={betaModalOpen} 
        onOpenChange={setBetaModalOpen}
      />
    </>
  )
}
