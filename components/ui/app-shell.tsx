"use client";

import type { ElementType, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Settings,
  GraduationCap,
  Users,
  FileText,
  ClipboardList,
  Palette,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  PenLine,
} from "lucide-react";

/**
 * Données de la barre latérale façon CRM (demande de Nora, 24/08/2026) —
 * calculées côté serveur dans app/(app)/layout.tsx (getSidebarData) puis
 * transmises ici. `null` tant que l'organisme n'existe pas encore ou que
 * "Mon entreprise" n'a pas été complétée (pas encore d'application
 * "complète" à naviguer).
 */
export type SidebarData = {
  companyName: string;
  trainingName: string | null;
  hasSession: boolean;
  documentsGenerated: number;
  documentsTotal: number;
  missingFieldsCount: number;
  isAdmin: boolean;
};

/**
 * Enveloppe commune à toutes les pages de l'espace connecté. Pas de barre
 * latérale pendant l'onboarding (parcours guidé étape par étape, chaque
 * écran garde son propre centrage) ni tant que `data` est `null` — la
 * navigation façon CRM n'apparaît que sur la partie "application complète"
 * (tableau de bord, documents, paramètres, back-office...).
 */
export function AppShell({ data, children }: { data: SidebarData | null; children: ReactNode }) {
  const pathname = usePathname();

  if (!data || pathname.startsWith("/onboarding")) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto flex max-w-6xl items-start gap-6 px-4 py-6 sm:px-6">
      <AppSidebar data={data} pathname={pathname} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}

type NavItem = {
  href: string;
  label: string;
  icon: ElementType;
  badge?: string;
  badgeWarning?: boolean;
};

function AppSidebar({ data, pathname }: { data: SidebarData; pathname: string }) {
  const items: NavItem[] = [
    { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { href: "/parametres/entreprise", label: "Mon entreprise", icon: Building2 },
    { href: "/parametres/qualite", label: "Informations qualité", icon: Settings },
    {
      href: data.trainingName ? "/parametres/formation" : "/onboarding/activite",
      label: "Ma formation",
      icon: GraduationCap,
    },
    {
      href: data.hasSession ? "/parametres/session" : "/onboarding/session",
      label: "Ma session",
      icon: Users,
    },
    {
      href: "/documents",
      label: "Mes documents",
      icon: FileText,
      badge: data.documentsTotal > 0 ? `${data.documentsGenerated}/${data.documentsTotal}` : undefined,
      badgeWarning: data.missingFieldsCount > 0,
    },
    {
      href: data.hasSession ? "/emargement" : "/onboarding/session",
      label: "Émargements",
      icon: PenLine,
    },
    { href: "/evaluation", label: "Évaluation des acquis", icon: ClipboardList },
    { href: "/parametres/identite-visuelle", label: "Identité visuelle", icon: Palette },
    { href: "/parametres/abonnement", label: "Mon abonnement", icon: CreditCard },
  ];

  if (data.isAdmin) {
    items.push({ href: "/admin", label: "Back-office admin", icon: ShieldCheck });
  }

  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <div className="sticky top-6 rounded-lg border border-gray-200 bg-white p-3">
        <p className="mb-3 truncate px-2 text-xs font-medium uppercase tracking-wide text-gray-400">
          {data.companyName}
        </p>
        <nav className="flex flex-col gap-0.5">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm transition ${
                  active ? "bg-blue-50 font-medium text-blue-900" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badge && (
                  <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-xs ${
                      item.badgeWarning ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {data.missingFieldsCount > 0 && (
          <Link
            href="/documents"
            className="mt-3 flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-2 text-xs text-amber-800 transition hover:bg-amber-100"
          >
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {data.missingFieldsCount} information{data.missingFieldsCount > 1 ? "s" : ""} à compléter
          </Link>
        )}
      </div>
    </aside>
  );
}
