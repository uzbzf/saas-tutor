import type { Metadata } from "next";
import { Dela_Gothic_One, Montserrat } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const delaGothic = Dela_Gothic_One({
  weight: "400",
  subsets: ["latin", "cyrillic"],
  variable: "--font-dela-gothic",
});

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "LEXIS AI — Персональный AI-репетитор английского языка",
  description:
    "Интеллектуальная SaaS-платформа для изучения английского языка с Gemini 3.5 Flash-Lite: уроки, квизы, грамматика, произношение, speaking, reading и listening.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${delaGothic.variable} ${montserrat.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
