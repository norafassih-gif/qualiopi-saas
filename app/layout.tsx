import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Logiciel Qualiopi",
  description: "Préparez votre dossier Qualiopi sans IA, sans prise de tête.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-gray-900 font-sans">
        {children}
      </body>
    </html>
  );
}
