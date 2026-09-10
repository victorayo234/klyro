import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Klyro — Business Management Platform",
  description: "All-in-one business management platform for small and medium enterprises. Manage CRM, inventory, sales, expenses, invoices, and analytics from a unified dashboard.",
  keywords: ["business management", "SaaS", "CRM", "inventory management", "invoicing", "sales analytics"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem("klyro_theme");
                  var isDark = false;
                  if (stored === "dark") {
                    isDark = true;
                  } else if (stored === "light") {
                    isDark = false;
                  } else {
                    isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                  }
                  if (isDark) {
                    document.documentElement.classList.add("dark");
                  } else {
                    document.documentElement.classList.remove("dark");
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[var(--background)] text-[var(--foreground)] selection:bg-blue-600 selection:text-white">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--card)",
              color: "var(--card-foreground)",
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
            },
          }}
        />
      </body>
    </html>
  );
}
