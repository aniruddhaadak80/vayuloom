import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { VayuThemeProvider } from "@/components/theme-provider";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const body = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VayuLoom — The air safety OS for Indian schools",
    template: "%s · VayuLoom",
  },
  description:
    "Delhi chokes every October. VayuLoom turns hyperlocal AQI, stubble fires and wind into automatic GRAP-based school actions, exposure scores and printable Hindi/English action cards.",
  metadataBase: new URL("https://vayuloom.example"),
  openGraph: {
    title: "VayuLoom — The air safety OS for Indian schools",
    description:
      "AQI 312 → principal action card + parent alert + timetable shift in one click. Offline-first, zero keys.",
    type: "website",
    images: [{ url: "/og", width: 1200, height: 630, alt: "VayuLoom cover" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VayuLoom — The air safety OS for Indian schools",
    description:
      "Stubble-to-classroom tracer, GRAP autopilot and a breathing-city swarm. Built for Delhi October.",
    images: ["/og"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body
        className={`${display.variable} ${body.variable} ${mono.variable} flex min-h-full flex-col bg-ink font-sans text-slate-100 antialiased light:bg-paper light:text-ink`}
      >
        <VayuThemeProvider>
          <SiteNav />
          <div className="flex flex-1 flex-col">{children}</div>
          <SiteFooter />
        </VayuThemeProvider>
      </body>
    </html>
  );
}
