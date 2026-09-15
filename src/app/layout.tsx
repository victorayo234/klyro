import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
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
  title: {
    default: "Klyro",
    template: "Klyro - %s",
  },
  description: "Precision business operating system for small and medium enterprises. Manage CRM, inventory, sales, expenses, invoices, and analytics from a unified workspace.",
  keywords: ["business management", "CRM", "inventory management", "invoicing", "sales analytics"],
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
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
      <body className="min-h-full flex flex-col font-sans bg-[var(--background)] text-[var(--foreground)] selection:bg-indigo-600 selection:text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
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
        </ThemeProvider>
      </body>
    </html>
  );
}
