// Libellés affichés pour les valeurs de organization_billing (migration
// 0036). Fichier à part (pas dans lib/actions/admin.ts) parce qu'un fichier
// "use server" ne peut exporter que des fonctions async (Server Actions) —
// ces deux fonctions sont de simples formatteurs synchrones, utilisables
// aussi bien côté serveur que client.

const PLAN_LABELS: Record<string, string> = {
  documents: "1 — Documents",
  documents_site: "2 — Documents + Site",
  documents_site_accompagnement: "3 — + Accompagnement",
  tout_compris: "4 — Tout compris + LMS",
};

const STATUS_LABELS: Record<string, string> = {
  trialing: "Essai",
  active: "Actif",
  past_due: "Paiement en retard",
  canceled: "Résilié",
  incomplete: "Incomplet",
};

export function planLabel(plan: string): string {
  return PLAN_LABELS[plan] ?? plan;
}

export function subscriptionStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}
