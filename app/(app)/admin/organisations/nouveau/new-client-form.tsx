"use client";

import { useActionState, useState } from "react";
import { Copy, Check } from "lucide-react";
import Link from "next/link";
import type { CreateClientFormState } from "@/lib/actions/admin";
import { createClientOrganization } from "@/lib/actions/admin";

const initialState: CreateClientFormState = { error: null };

const PLAN_OPTIONS = [
  { value: "documents", label: "1 — Documents" },
  { value: "documents_site", label: "2 — Documents + Site" },
  { value: "tout_compris", label: "3 — Tout compris + LMS" },
];

function CopyableLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-gray-50 p-2">
      <code className="flex-1 overflow-x-auto whitespace-nowrap text-xs text-gray-700">{link}</code>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(link);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="shrink-0 rounded-md border border-gray-300 p-1.5 text-gray-600 hover:bg-white"
        aria-label="Copier le lien"
      >
        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

/**
 * Formulaire "créer un nouveau client" — demande de Nora (24/08/2026) : un
 * seul geste depuis le back-office pour créer le compte ET l'organisme d'un
 * client, formule déjà active, sans passer par Stripe. Après création, pas
 * de redirection : on affiche le lien "définir votre mot de passe" à
 * transmettre soi-même au client (aucun envoi d'email automatique configuré).
 */
export function NewClientForm() {
  const [state, formAction, pending] = useActionState(createClientOrganization, initialState);

  if (state.setupLink) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-5">
        <p className="mb-1 text-sm font-semibold text-green-900">Compte créé !</p>
        <p className="mb-3 text-sm text-green-800">
          Ce lien connecte directement au compte du client (aucun mot de passe à définir). Ouvre-le
          toi-même pour agir en son nom, ou copie-le pour le lui transmettre (email, WhatsApp...) —
          aucun envoi automatique n&apos;est configuré.
        </p>
        <a
          href={state.setupLink}
          target="_blank"
          rel="noreferrer"
          className="mb-3 inline-block rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-white"
        >
          Ouvrir la session client →
        </a>
        <CopyableLink link={state.setupLink} />
        <div className="mt-4 flex gap-3 text-sm">
          {state.organizationId && (
            <Link href={`/admin/organisations/${state.organizationId}`} className="text-blue-900 underline">
              Voir/gérer cet organisme
            </Link>
          )}
          <Link href="/admin/organisations" className="text-blue-900 underline">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
      <label className="flex flex-col gap-1 text-xs text-gray-700">
        Nom de l&apos;organisme *
        <input
          name="company_name"
          required
          placeholder="Ex. Excellence Formation"
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-gray-700">
        Email du client (identifiant de connexion) *
        <input
          type="email"
          name="email"
          required
          placeholder="contact@excellence-formation.fr"
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-gray-700">
        Nom commercial
        <input name="commercial_name" className="rounded-md border border-gray-300 px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs text-gray-700">
        Téléphone
        <input name="phone" className="rounded-md border border-gray-300 px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs text-gray-700">
        Formule à activer
        <select name="plan" defaultValue="tout_compris" className="rounded-md border border-gray-300 px-2 py-1.5 text-sm">
          {PLAN_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <span className="text-xs font-normal text-gray-500">
          Les add-ons (personnalisation, branding) s&apos;activent ensuite depuis la fiche de l&apos;organisme.
        </span>
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Création…" : "Créer le client"}
      </button>
    </form>
  );
}
