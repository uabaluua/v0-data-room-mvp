"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Share2, LinkIcon, Mail, Copy, X, Eye, EditIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface ShareDialogProps {
  itemType: "data_room" | "folder" | "file"
  itemId: string
  itemName: string
  children?: React.ReactNode
}

interface Share {
  id: string
  shared_with: string | null
  shared_with_profile: { id: string; email: string } | null
  permission: "view" | "edit"
  share_token: string | null
  created_at: string
}

export function ShareDialog({ itemType, itemId, itemName, children }: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [permission, setPermission] = useState<"view" | "edit">("view")
  const [shares, setShares] = useState<Share[]>([])
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      loadShares()
    }
  }, [isOpen, itemId])

  const loadShares = async () => {
    const supabase = createClient()

    const columnName = itemType === "data_room" ? "data_room_id" : itemType === "folder" ? "folder_id" : "file_id"

    const { data, error } = await supabase
        .from("shares")
        .select(`
          *,
          shared_by_profile:profiles!shares_shared_by_fkey (id, email),
          shared_with_profile:profiles!shares_shared_with_fkey (id, email)
        `)
        .eq(columnName, itemId)

    if (error) {
      console.error("Error loading shares:", error)
      return
    }

    if (data) {
      const formattedShares = data.map((share: any) => ({
        ...share,
      }))

      setShares(formattedShares)

      // Find existing share link
      const linkShare = formattedShares.find((s: Share) => s.share_token)
      if (linkShare) {
        setShareLink(`${window.location.origin}/shared/${linkShare.share_token}`)
      }
    }
  }

  const handleEmailShare = async () => {
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    // Find user by email
    const { data: profileData, error: profileError } = await supabase
        .rpc("get_profile_id_by_email", { p_email: email.trim() })

    if (profileError || !profileData?.id) {
      toast({
        title: "Error",
        description: "User not found with this email address",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setIsLoading(false)
      return
    }

    // Create share
    const shareData: any = {
      shared_by: user.id,
      shared_with: profileData.id,
      permission,
    }

    if (itemType === "data_room") shareData.data_room_id = itemId
    else if (itemType === "folder") shareData.folder_id = itemId
    else shareData.file_id = itemId

    const { error } = await supabase.from("shares").insert(shareData)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to share. User may already have access.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: `Shared with ${email}`,
      })
      setEmail("")
      await loadShares()
    }
    setIsLoading(false)
  }

  const handleGenerateLink = async () => {
    if (shareLink) {
      // Copy existing link
      navigator.clipboard.writeText(shareLink)
      toast({
        title: "Copied",
        description: "Share link copied to clipboard",
      })
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setIsLoading(false)
      return
    }

    // Generate unique token
    const token = crypto.randomUUID()

    const shareData: any = {
      shared_by: user.id,
      share_token: token,
      permission,
    }

    if (itemType === "data_room") shareData.data_room_id = itemId
    else if (itemType === "folder") shareData.folder_id = itemId
    else shareData.file_id = itemId

    const { error } = await supabase.from("shares").insert(shareData)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to generate share link",
        variant: "destructive",
      })
    } else {
      const link = `${window.location.origin}/shared/${token}`
      setShareLink(link)
      navigator.clipboard.writeText(link)
      toast({
        title: "Success",
        description: "Share link created and copied to clipboard",
      })
      await loadShares()
    }
    setIsLoading(false)
  }

  const handleRemoveShare = async (shareId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("shares").delete().eq("id", shareId)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove share",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Share removed",
      })

      // If removing link share, clear the link
      const removedShare = shares.find((s) => s.id === shareId)
      if (removedShare?.share_token) {
        setShareLink(null)
      }

      await loadShares()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share {itemName}</DialogTitle>
          <DialogDescription>Share this {itemType.replace("_", " ")} with others via email or link</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="email" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="link">
              <LinkIcon className="h-4 w-4 mr-2" />
              Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleEmailShare()
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="permission">Permission</Label>
                <Select value={permission} onValueChange={(value: "view" | "edit") => setPermission(value)}>
                  <SelectTrigger id="permission">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        View only
                      </div>
                    </SelectItem>
                    <SelectItem value="edit">
                      <div className="flex items-center gap-2">
                        <EditIcon className="h-4 w-4" />
                        Can edit
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleEmailShare} disabled={isLoading} className="w-full">
                Share
              </Button>
            </div>

            {shares.filter((s) => s.shared_with).length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <Label>Shared with</Label>
                <div className="space-y-2">
                  {shares
                    .filter((s) => s.shared_with)
                    .map((share) => (
                      <div key={share.id} className="flex items-center justify-between p-2 rounded-lg border">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-sm truncate">{share.shared_with_profile?.email}</span>
                          <Badge variant={share.permission === "edit" ? "default" : "secondary"}>
                            {share.permission}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0"
                          onClick={() => handleRemoveShare(share.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="link" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="link-permission">Permission</Label>
                <Select value={permission} onValueChange={(value: "view" | "edit") => setPermission(value)}>
                  <SelectTrigger id="link-permission">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        View only
                      </div>
                    </SelectItem>
                    <SelectItem value="edit">
                      <div className="flex items-center gap-2">
                        <EditIcon className="h-4 w-4" />
                        Can edit
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleGenerateLink} disabled={isLoading} className="w-full">
                <LinkIcon className="h-4 w-4 mr-2" />
                {shareLink ? "Copy Link" : "Generate Link"}
              </Button>

              {shareLink && (
                <div className="space-y-2 p-3 rounded-lg border bg-muted">
                  <Label className="text-xs">Share link</Label>
                  <div className="flex items-center gap-2">
                    <Input value={shareLink} readOnly className="text-sm" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(shareLink)
                        toast({ title: "Copied", description: "Link copied to clipboard" })
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Anyone with this link can access this {itemType.replace("_", " ")}
                  </p>
                </div>
              )}

              {shareLink && shares.find((s) => s.share_token) && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const linkShare = shares.find((s) => s.share_token)
                    if (linkShare) handleRemoveShare(linkShare.id)
                  }}
                >
                  Remove Link
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
