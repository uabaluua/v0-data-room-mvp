"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DataRoomProvider } from "@/lib/data-room-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { Share } from "@/types";
import SharedContent from "@/components/shared-content";

export default function SharedPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [share, setShare] = useState<Share | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadShare() {
      if (!token) {
        setError("Invalid share link");
        setIsLoading(false);
        return;
      }

      const supabase = createClient();
      const { data, error: shareError } = await supabase
        .from("shares")
        .select("*")
        .eq("share_token", token)
        .single();

      if (shareError || !data) {
        setError("Share link not found or expired");
        setIsLoading(false);
        return;
      }

      // Check if expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setError("This share link has expired");
        setIsLoading(false);
        return;
      }

      setShare(data);
      setIsLoading(false);
    }

    loadShare();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading shared content...</p>
        </div>
      </div>
    );
  }

  if (error || !share) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Share Not Found</h2>
              <p className="text-muted-foreground mb-4">
                {error || "This share link is invalid or has been removed."}
              </p>
              <Button onClick={() => router.push("/")}>Go to Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DataRoomProvider>
      <SharedContent share={share} />
    </DataRoomProvider>
  );
}
