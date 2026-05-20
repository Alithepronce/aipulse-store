import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import { TelegramWidget } from "@/components/ui/TelegramWidget";

const tajawal = Tajawal({ 
  weight: ["300", "400", "500", "700", "800", "900"],
  subsets: ["arabic"], 
  variable: "--font-tajawal" 
});

export const metadata: Metadata = {
  title: "Ai Pulse | نبض الذكاء",
  description: "منصة رائدة للمنتجات الرقمية، كورسات، وكتب إلكترونية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${tajawal.variable} antialiased min-h-screen flex flex-col`}
        style={{ fontFamily: 'var(--font-tajawal), sans-serif' }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <TelegramWidget />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
