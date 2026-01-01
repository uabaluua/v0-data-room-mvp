import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DataRoomApp } from "@/components/data-room-app"

export default async function ProtectedPage({
  searchParams,
}: {
  searchParams: Promise<{ dataRoom?: string; folder?: string; file?: string }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const params = await searchParams

  return <DataRoomApp userId={user.id} userEmail={user.email || ""} initialDataRoomId={params.dataRoom} initialFolderId={params.folder} initialFileId={params.file} />
}
