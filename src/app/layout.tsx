import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BoardVerse AI | Unified Visual Workspace",
  description: "Collaborate visually in real-time, communicate, and manage ideas from a single, calm application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Default to dark mode for the premium SaaS look
    <html lang="en" className="dark">
      <head>
        <link rel="stylesheet" href="/excalidraw.css" />
      </head>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
