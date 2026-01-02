"use client"

import {Button} from "@/components/ui/button"
import {LogOut} from "lucide-react"
import {createClient} from "@/lib/supabase/client"
import {useRouter} from "next/navigation"
import Link from "next/link"
import type {User} from "@supabase/auth-js/src/lib/types"
import { MobileNavTrigger } from "@/components/side-nav"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Header = ({user}: {user: User}) => {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="border-b bg-card fixed top-0 left-0 right-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MobileNavTrigger />
          <Link href="/" className="flex-shrink-0">
            <h1 className="text-lg md:text-xl font-semibold">Data Room</h1>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {user.email?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="hidden md:inline">{user.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2"/>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

export default Header