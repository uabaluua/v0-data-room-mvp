"use client";

import { useEffect, useState } from "react";
import { X, Download, ZoomIn, ZoomOut } from "lucide-react";
import { useDataRoom } from "@/lib/data-room-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface PDFViewerProps {
  fileId: string;
  onClose: () => void;
}

interface File {
  id: string;
  name: string;
  data: string;
  size: number;
  created_at: string;
}

export function PDFViewer({ fileId, onClose }: PDFViewerProps) {
  const { files } = useDataRoom();
  const [zoom, setZoom] = useState(100);
  const [file, setFile] = useState<File | null>(null);

  // If no file prop, try to find from context or load from database
  useEffect(() => {
    // Check if we already have this file loaded
    if (file && file.id === fileId) {
      return;
    }

    const fileFromContext = files.find((f) => f.id === fileId);
    if (fileFromContext) {
      console.log(
        "PDFViewer: Using file from context, data length:",
        fileFromContext.data?.length || 0,
      );
      setFile(fileFromContext);
    } else {
      // Load from database
      async function loadFile() {
        console.log("PDFViewer: Loading file from database:", fileId);
        const supabase = createClient();
        const { data, error } = await supabase
          .from("files")
          .select("*")
          .eq("id", fileId)
          .single();

        if (data && !error) {
          console.log(
            "PDFViewer: File loaded, data length:",
            data.data?.length || 0,
          );
          // Ensure data is in correct format
          const fileWithFormattedData = {
            ...data,
            data: data.data?.startsWith("data:")
              ? data.data
              : `data:application/pdf;base64,${data.data}`,
          };
          setFile(fileWithFormattedData);
        } else {
          console.error("PDFViewer: Error loading file:", error);
        }
      }
      loadFile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId, files]);

  useEffect(() => {
    console.log("[v0] PDF viewer opened for file:", fileId);
  }, [fileId]);

  if (!file) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md" showCloseButton={false}>
          <DialogTitle className="sr-only">Loading file</DialogTitle>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading file...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleDownload = () => {
    const link = document.createElement("a");
    // Ensure data is in correct format
    let dataUrl = file.data;
    if (!dataUrl.startsWith("data:")) {
      dataUrl = `data:application/pdf;base64,${dataUrl}`;
    }
    link.href = dataUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Ensure file data is in correct format for iframe
  const getFileBlobUrl = () => {
    if (!file?.data) return "";

    // Strip prefix if present
    const base64 = file.data.startsWith("data:")
      ? file.data.split(",")[1]
      : file.data;

    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length)
      .fill(0)
      .map((_, i) => byteCharacters.charCodeAt(i));

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });

    return URL.createObjectURL(blob);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent
        className="max-w-6xl h-[90vh] flex flex-col p-0"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{file.name}</DialogTitle>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold truncate">{file.name}</h2>
            <p className="text-sm text-muted-foreground">
              {new Date(file.created_at).toLocaleDateString()} •{" "}
              {Math.round(file.size / 1024)} KB
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
              onClick={handleDownload}
              title="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-auto bg-muted/20 p-4">
          <div
            className="mx-auto"
            style={{ width: `${zoom}%`, maxWidth: "100%" }}
          >
            <iframe
              key={file.id} // Force re-render when file changes
              src={getFileBlobUrl()}
              className="w-full h-[calc(90vh-100px)] bg-white rounded shadow-lg"
              title={file.name}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
