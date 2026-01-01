"use client"

import {Button} from "@/components/ui/button"
import {GlobalSearch} from "@/components/global-search"
import {LogOut} from "lucide-react"
import {createClient} from "@/lib/supabase/client"
import {useRouter} from "next/navigation"
import Link from "next/link"
import type {User} from "@supabase/auth-js/src/lib/types";

const Header = ({user}: {user: User}) => {
  const router = useRouter()

    const
  handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <Link href="/">
          <h1 className="text-xl font-semibold">Data Room's <small className="text-sm">({user.email})</small></h1>
          <p className="text-sm text-muted-foreground">Manage folders and documents</p>
        </Link>
        <div className="flex items-center gap-2">
          <GlobalSearch/>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2"/>
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Header