import type React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { DataRoomProvider } from "@/lib/data-room-context";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Data Room - Secure Document Management",
  description:
    "Secure document repository for due diligence and file management",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <DataRoomProvider>
          {children}
          <Toaster />
        </DataRoomProvider>
        <Analytics />
      </body>
    </html>
  );
}
