"use client"

import { Home, UserPlus, Search, HelpCircle } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useState } from "react"
import { GlobalSearch } from "@/components/global-search"

function NavContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname()
  const isHome = pathname === "/"
  const isShared = pathname === "/shared"

  return (
    <div className="flex flex-col h-full w-full">
      {/* Primary Navigation */}
      <div className="p-4 space-y-1">
        <Link
          href="/"
          onClick={onLinkClick}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            isHome && !isShared
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Home className="h-4 w-4" />
          Home
        </Link>
        <Link
          href="/shared"
          onClick={onLinkClick}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            isShared
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <UserPlus className="h-4 w-4" />
          Shared with me
        </Link>
        <div className="w-full">
          <GlobalSearch placeholder="Search files and folders..." />
        </div>
      </div>
    </div>
  )
}

export function SideNav() {
  return (
    <>
      {/* Desktop Side Nav */}
      <nav className="hidden md:flex w-64 border-r bg-card h-screen">
        <NavContent />
      </nav>
    </>
  )
}

export function MobileNavTrigger() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <nav className="h-full bg-card">
          <NavContent onLinkClick={() => setOpen(false)} />
        </nav>
      </SheetContent>
    </Sheet>
  )
}

