import { NextResponse } from "next/server";
import { isPlatformAdmin, listOrganizationsForAdmin } from "@/lib/actions/admin";
import { planLabel, subscriptionStatusLabel } from "@/lib/billing-labels";

/**
 * Export CSV de la liste des organismes clients — demande de Nora
 * (24/08/2026) : "avoir accès à leur email pour leur envoyer du marketing".
 * Réutilise exactement la même liste que /admin/organisations (même
 * fonction `listOrganizationsForAdmin`), au format CSV plutôt qu'en HTML,
 * pour être importé tel quel dans un outil d'emailing (Brevo, Mailchimp…).
 *
 * Volontairement une route API (pas une Server Action) : le navigateur doit
 * pouvoir déclencher un vrai téléchargement de fichier via un lien simple
 * (<a href="/api/admin/export-organizations">), ce qu'une Server Action ne
 * permet pas directement.
 */
function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatDateForCsv(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date(iso)
  );
}

export async function GET() {
  if (!(await isPlatformAdmin())) {
    return NextResponse.json({ error: "Accès réservé aux administrateurs de la plateforme." }, { status: 403 });
  }

  const organizations = await listOrganizationsForAdmin();

  const header = ["Organisme", "Nom commercial", "Email", "Formule", "Statut", "Bloqué", "Inscrit le"];
  const rows = organizations.map((o) =>
    [
      o.company_name,
      o.commercial_name ?? "",
      o.email ?? "",
      planLabel(o.plan),
      subscriptionStatusLabel(o.subscription_status),
      o.is_blocked ? "Oui" : "Non",
      formatDateForCsv(o.created_at),
    ]
      .map(csvEscape)
      .join(",")
  );

  // BOM UTF-8 en tête : Excel (très probablement l'outil utilisé pour ouvrir
  // ce fichier) affiche sinon les accents mal encodés sans ce marqueur.
  const csv = "﻿" + [header.join(","), ...rows].join("\n");
  const today = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="organismes-qualiopi-pilote-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
