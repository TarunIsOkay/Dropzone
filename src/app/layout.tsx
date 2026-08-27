import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DropZone — Competitive Esports Platform",
  description:
    "Build your squad. Master the map. Dominate the competition. The premier competitive esports platform for Free Fire.",
  keywords: [
    "esports",
    "free fire",
    "competitive gaming",
    "tournament",
    "team finder",
    "tactical maps",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-dz-bg text-dz-text antialiased">
        {children}
      </body>
    </html>
  );
}
