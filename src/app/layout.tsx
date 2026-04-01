import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import type { ReactNode } from "react";

export const metadata = {
  title: "Inventory Monitor",
  description: "Inventory monitoring dashboard built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
