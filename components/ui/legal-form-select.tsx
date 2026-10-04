import { LEGAL_FORMS } from "@/lib/engine/tracks";

/** Sélecteur de forme juridique, partagé par l'onboarding et « Mon entreprise ». */
export function LegalFormSelect({ defaultValue }: { defaultValue?: string | null }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      Forme juridique
      <select
        name="legal_form"
        defaultValue={defaultValue ?? ""}
        className="rounded-md border border-gray-300 bg-white px-3 py-2"
      >
        <option value="">Choisir…</option>
        {LEGAL_FORMS.map((f) => (
          <option key={f.id} value={f.id}>
            {f.label}
          </option>
        ))}
      </select>
      <span className="text-xs text-gray-500">
        Indiquée sur votre avis de situation Sirene ou votre extrait Kbis. Elle détermine les
        justificatifs à fournir pour votre déclaration d&apos;activité.
      </span>
    </label>
  );
}
