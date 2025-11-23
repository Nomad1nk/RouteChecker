import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Use Google Font instead of local files
import "./globals.css";

// Initialize the Google Font
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EcoRoute Dashboard",
  description: "Sustainable Logistics Optimizer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        // Use the Google Font class name
        className={`${inter.className} antialiased`}
        // Keep this to prevent browser extension errors
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}