import type { Metadata } from "next";
import "./globals.css";
import { CookieBanner } from "@/components/cookie-banner";

export const metadata: Metadata = {
  title: "Logiciel Qualiopi",
  description: "Préparez votre dossier Qualiopi sans IA, sans prise de tête.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-gray-900 font-sans">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
