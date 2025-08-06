import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StructCheck AI",
  description:
    "Upload structural design documents for instant automated plan checks and early issue detection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col h-screen max-h-screen`}
      >
        <AuthProvider>
          <Navbar />
          <div className="flex flex-1 w-full overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex items-center">{children}</div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
