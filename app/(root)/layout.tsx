import {ReactNode} from "react"
import Header from '@/components/header'
import {getCurrentUser} from "@/lib/supabase/server"
import {redirect} from "next/navigation"

const Layout = async ({children}: { children: ReactNode }) => {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}

export default Layout
