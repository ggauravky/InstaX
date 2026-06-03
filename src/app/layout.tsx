import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/TheamProvider";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/sidebar";
import { Toaster } from "react-hot-toast";
import Script from "next/script";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0e1a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://instax-g.vercel.app"),
  title: {
    default: "InstaX - Premium Next.js Social Media Platform",
    template: "%s | InstaX",
  },
  description:
    "A premium, blazing-fast social media platform powered by Next.js 16, React 19, Tailwind CSS v4, Prisma, and Neon PostgreSQL.",
  keywords: [
    "InstaX",
    "social media app",
    "social media platform",
    "Instagram clone",
    "Next.js social media app",
    "Open source social platform",
    "React social media website",
    "Prisma social media app",
    "Full stack social media project",
    "Next.js 16 project",
    "Social networking website",
    "Gaurav Kumar Yadav",
  ],
  authors: [{ name: "Gaurav Kumar Yadav", url: "https://ggauravky.vercel.app" }],
  creator: "Gaurav Kumar Yadav",
  publisher: "Gaurav Kumar Yadav",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "InstaX - Premium Next.js Social Media Platform",
    description:
      "A premium, blazing-fast social media platform powered by Next.js 16, React 19, Tailwind CSS v4, Prisma, and Neon PostgreSQL.",
    url: "https://instax-g.vercel.app",
    siteName: "InstaX",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/social-preview.svg",
        width: 1200,
        height: 630,
        alt: "InstaX OpenGraph Image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "InstaX - Premium Next.js Social Media Platform",
    description:
      "A premium, blazing-fast social media platform powered by Next.js 16, React 19, Tailwind CSS v4, Prisma, and Neon PostgreSQL.",
    creator: "@ggauravky",
    images: ["/social-preview.svg"],
  },
  verification: {
    google: "google45df87e2a8d617f3",
    yandex: "yandex-verification-id-placeholder",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <Script
            src="https://cloud.umami.is/script.js"
            data-website-id="cf6cbce6-8611-4efd-a714-a97caf1652ad"
            strategy="afterInteractive"
          />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen">
              <Navbar />

              <main className="py-8">
                {/* container to center the content */}
                <div className="max-w-7xl mx-auto px-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="hidden lg:block lg:col-span-3">
                      <Sidebar />
                    </div>
                    <div className="lg:col-span-9">{children}</div>
                  </div>
                </div>
              </main>
            </div>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
