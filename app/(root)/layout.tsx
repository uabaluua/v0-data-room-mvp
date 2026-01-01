import {ReactNode} from "react"
import Header from '@/components/header'
import { SideNav } from '@/components/side-nav'
import {getCurrentUser} from "@/lib/supabase/server"
import {redirect} from "next/navigation"

const Layout = async ({children}: { children: ReactNode }) => {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header user={user} />
      <div className="flex flex-1 pt-16">
        <SideNav />
        <main className="flex-1 overflow-auto md:ml-64">
          <div className="container mx-auto px-4 py-6 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
