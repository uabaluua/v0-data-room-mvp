import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DataRoomApp } from "@/components/data-room-app"

export default async function ProtectedPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  return <DataRoomApp userId={user.id} userEmail={user.email || ""} />
}
