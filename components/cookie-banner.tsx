"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "qualiopi_cookie_consent_v1";

/**
 * Bandeau cookies — affiché sur toutes les pages (marketing, connectées,
 * légales) tant que le visiteur ne l'a pas fermé, puis mémorisé dans le
 * navigateur (localStorage, jamais renvoyé au serveur) pour ne plus jamais
 * réapparaître sur cet appareil.
 *
 * Contenu volontairement simple ("j'ai compris" plutôt qu'un vrai choix
 * accepter/refuser) : cf. page /cookies — seul le cookie de session
 * strictement nécessaire de Supabase Auth est utilisé aujourd'hui, aucun
 * outil d'analytics/publicité n'est installé (vérifié dans package.json,
 * Phase 19). Si un futur outil de mesure d'audience venait à être ajouté,
 * ce bandeau devra être remplacé par un vrai recueil de consentement
 * (accepter / refuser / personnaliser).
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // setState différé (plutôt qu'appelé directement dans le corps de
    // l'effet) — évite l'avertissement react-hooks/set-state-in-effect tout
    // en gardant une simple lecture ponctuelle du stockage local au montage.
    const timer = window.setTimeout(() => {
      try {
        if (!window.localStorage.getItem(STORAGE_KEY)) {
          setVisible(true);
        }
      } catch {
        // Stockage indisponible (navigation privée stricte, etc.) — on
        // affiche quand même le bandeau une fois par visite plutôt que de
        // planter.
        setVisible(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Rien à faire de plus si le stockage échoue — le bandeau se
      // referme quand même pour cette visite.
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:inset-x-auto sm:right-4"
      role="region"
      aria-label="Information sur les cookies"
    >
      <div
        className="mx-auto flex max-w-xl flex-col gap-3 rounded-xl border border-white/10 p-4 shadow-2xl backdrop-blur sm:flex-row sm:items-center"
        style={{ backgroundColor: "rgba(3, 7, 18, 0.96)" }}
      >
        <p className="text-sm text-gray-300">
          Nous utilisons uniquement le cookie strictement nécessaire à votre connexion — aucun
          cookie publicitaire ou de mesure d&apos;audience.{" "}
          <Link href="/cookies" className="underline decoration-gray-500 underline-offset-2 hover:text-white">
            En savoir plus
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
        >
          J&apos;ai compris
        </button>
      </div>
    </div>
  );
}
