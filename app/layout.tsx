import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, Public_Sans } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-lab-display-source", subsets: ["latin"],
  weight: ["500", "700", "800"], display: "swap",
});
const body = Public_Sans({
  variable: "--font-lab-body-source", subsets: ["latin"],
  weight: ["400", "500", "600", "700"], display: "swap",
});
const mono = IBM_Plex_Mono({
  variable: "--font-lab-mono-source", subsets: ["latin"],
  weight: ["500", "600"], display: "swap",
});

export const metadata: Metadata = {
  title: "Administración | Laboratorio Clínico Acapulco",
  description: "Panel de administración del Laboratorio Clínico Acapulco.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
