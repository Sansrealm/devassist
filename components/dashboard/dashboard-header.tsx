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
import { LogOut, Settings, Plus } from "lucide-react"
import { signOut } from "@/lib/auth/actions"
import Link from "next/link"

interface DashboardHeaderProps {
  user: {
    id: string
    email?: string
    user_metadata?: {
      avatar_url?: string
      full_name?: string
    }
  }
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const userInitials = user.email?.charAt(0).toUpperCase() || "U"

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-[#002F71] to-[#0A4BA0] rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">DS</span>
              </div>
              <span className="font-semibold text-lg">DevStack Companion</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/tools"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Tools
              </Link>
              <Link
                href="/projects"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Projects
              </Link>
              <Link
                href="/map"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Mapping
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              size="sm"
              className="bg-gradient-to-r from-[#002F71] to-[#0A4BA0] hover:from-[#001f4d] hover:to-[#083d87]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Tool
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} alt={user.email} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form action={signOut}>
                    <button type="submit" className="flex w-full items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
