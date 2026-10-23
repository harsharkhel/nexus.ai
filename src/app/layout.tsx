import type { Metadata } from "next";
import SpiderPull from "@/components/SpiderPull";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEXUS AI — Turn complexity into clarity",
  description:
    "NEXUS AI converts messy real-world information into verified, evidence-backed next steps. Powered by Gemini for emergency intelligence, healthcare navigation, and civic issue resolution.",
  keywords: [
    "AI analysis",
    "emergency intelligence",
    "healthcare navigator",
    "civic issues",
    "Gemini",
    "evidence-based",
  ],
  openGraph: {
    title: "NEXUS AI — Turn complexity into clarity",
    description:
      "Convert messy real-world information into verified, evidence-backed next steps.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("nexus_theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark");document.documentElement.setAttribute("data-theme","dark");}}catch(e){}})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SpiderPull />
        {children}
      </body>
    </html>
  );
}
