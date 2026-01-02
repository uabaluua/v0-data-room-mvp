"use client"

import { useState } from "react"
import { Home, UserPlus, Plus } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GlobalSearch } from "@/components/global-search"
import { useDataRoom } from "@/lib/data-room-context"

export function AppSidebar() {
  const pathname = usePathname()
  const isHome = pathname === "/"
  const isShared = pathname === "/shared"
  const { dataRooms, createDataRoom } = useDataRoom()
  const [newRoomName, setNewRoomName] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [error, setError] = useState("")

  const handleCreate = async () => {
    const trimmedName = newRoomName.trim()

    if (!trimmedName) {
      setError("Data room name cannot be empty")
      return
    }

    if (dataRooms.some((dr) => dr.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError("A data room with this name already exists")
      return
    }

    await createDataRoom(trimmedName)
    setNewRoomName("")
    setIsCreateOpen(false)
    setError("")
  }

  return (
    <>
      <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-1.5">
          <h2 className="text-lg font-semibold">Data Rooms</h2>
          <p className="text-sm text-muted-foreground mt-1">Secure document repositories for due diligence</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isHome && !isShared}>
                  <Link href="/">
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isShared}>
                  <Link href="/shared">
                    <UserPlus className="h-4 w-4" />
                    <span>Shared with me</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4" />
                  <span>Create Data Room</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <div className="px-2 py-1.5">
                  <GlobalSearch placeholder="Search files and folders..." />
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      </Sidebar>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Data Room</DialogTitle>
            <DialogDescription>Enter a name for your new data room</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Data Room Name</Label>
              <Input
                id="name"
                placeholder="Q1 2024 Due Diligence"
                value={newRoomName}
                onChange={(e) => {
                  setNewRoomName(e.target.value)
                  setError("")
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreate()
                  }
                }}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
