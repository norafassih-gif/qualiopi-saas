"use client";

import { useFormStatus } from "react-dom";

/**
 * Bouton de formulaire qui se desactive et change de libelle pendant
 * l'envoi. Sans cela, rien n'indique que le clic a ete pris en compte et
 * l'utilisateur reclique : c'est ce qui a cree des doublons dans le
 * registre de veille (retour de Nora, 23/09/2026).
 */
export function SubmitButton({
  label,
  pendingLabel,
  className,
}: {
  label: string;
  pendingLabel: string;
  className: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={className + (pending ? " cursor-not-allowed opacity-60" : "")}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
