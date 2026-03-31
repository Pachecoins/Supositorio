import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "D&R – Diarios y Revistas",
  description: "El puesto de diarios no cerró. Se mudó. Todos los diarios argentinos en un solo lugar.",
  manifest: "/manifest.json",
  openGraph: {
    title: "D&R – Diarios y Revistas",
    description: "El puesto de diarios no cerró. Se mudó. Todos los diarios argentinos en un solo lugar.",
    type: "website",
    locale: "es_AR",
    siteName: "D&R",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "D&R",
  },
};

export const viewport: Viewport = {
  themeColor: "#FDF6E3",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
