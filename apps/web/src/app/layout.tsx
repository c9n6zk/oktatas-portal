import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Padtárs",
  description: "Padtárs — a digitális iskolatársad, modern oktatásszervezési portál",
  icons: {
    icon: [
      { url: "/favicon-light.png", media: "(prefers-color-scheme: light)" },
      { url: "/favicon-dark.png", media: "(prefers-color-scheme: dark)" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          themes={["light", "dark", "high-contrast", "system"]}
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
