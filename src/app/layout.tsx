import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Inventory Monitor",
  description: "Inventory monitoring dashboard built with Next.js",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
