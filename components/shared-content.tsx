import { Share, File } from "@/types";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, ZoomIn, ZoomOut, Download } from "lucide-react";

export default function SharedContent({ share }: { share: Share }) {
  const [viewingFile, setViewingFile] = useState<File | null>(null);
  const [loadingContent, setLoadingContent] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    async function loadSharedContent() {
      setLoadingContent(true);
      setLoadError(null);
      const supabase = createClient();

      try {
        if (share.file_id) {
          const { data: fileData, error: fileError } = await supabase
            .from("files")
            .select("*")
            .eq("id", share.file_id)
            .single();

          if (fileError) {
            setLoadError(`Failed to load file: ${fileError.message}`);
            setLoadingContent(false);
            return;
          }

          if (fileData) {
            setViewingFile(fileData);
            setLoadingContent(false);
          } else {
            setLoadError("File not found");
            setLoadingContent(false);
          }
        }
      } catch (err) {
        setLoadError(
          `An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`,
        );
        setLoadingContent(false);
      }
    }

    loadSharedContent();
  }, [share]);

  if (loadingContent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading shared content...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Error Loading Content
              </h2>
              <p className="text-muted-foreground mb-4">{loadError}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (share.file_id) {
    if (!viewingFile) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading file...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background shrink-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold truncate">
              {viewingFile.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {new Date(viewingFile.created_at).toLocaleDateString()} •{" "}
              {Math.round(viewingFile.size / 1024)} KB
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[4rem] text-center">
              {zoom}%
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom((z) => Math.min(200, z + 10))}
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const link = document.createElement("a");
                link.href = viewingFile.data;
                link.download = viewingFile.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              title="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* PDF Content - Full Screen */}
        <div className="flex-1 overflow-auto bg-muted/20 p-4">
          <div
            className="mx-auto"
            style={{ width: `${zoom}%`, maxWidth: "100%" }}
          >
            <iframe
              src={viewingFile.data}
              className="w-full h-full min-h-[calc(100vh-120px)] bg-white rounded shadow-lg"
              title={viewingFile.name}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
