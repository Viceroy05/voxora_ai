import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";

import "./globals.css";

const fontSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontHeading = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Voxora AI | AI Voice Receptionist for High-Growth Businesses",
  description:
    "Voxora AI answers calls, books appointments, syncs with your CRM, and recovers missed leads for salons, clinics, gyms, real estate teams, and service businesses.",
  metadataBase: new URL("https://voxora.ai"),
  openGraph: {
    title: "Voxora AI",
    description:
      "An ultra-premium AI voice receptionist website and dashboard experience for modern businesses.",
    url: "https://voxora.ai",
    siteName: "Voxora AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Voxora AI",
    description:
      "AI voice receptionist for salons, clinics, gyms, real estate, and service teams.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${fontSans.variable} ${fontHeading.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
