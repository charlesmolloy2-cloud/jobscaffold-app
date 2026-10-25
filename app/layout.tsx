import type { ReactNode } from "react";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
