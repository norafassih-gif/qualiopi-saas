"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "./logo";

const NAV_LINKS = [
  { href: "/formations", label: "Formations" },
  { href: "/tarifs", label: "Tarifs" },
];

/**
 * Header public — Phase 27quater (24/08/2026).
 *
 * Avant ce correctif, la rangée de droite ("Se connecter" + "Créer mon
 * compte") n'avait aucune règle responsive : elle restait affichée telle
 * quelle sur mobile, sans espace suffisant pour les 4 éléments (logo,
 * Se connecter, Créer mon compte), ce qui la faisait passer à la ligne et
 * chevaucher le reste du bandeau — exactement le bug remonté par Nora
 * ("le texte est décalé", "Créer le compte, il dépasse, ce n'est pas
 * aligné"). Il n'y avait par ailleurs aucun menu hamburger : les liens
 * Formations/Tarifs étaient simplement masqués sous `sm` (`hidden sm:flex`)
 * sans aucun moyen d'y accéder sur mobile ("on n'a pas de hamburger pour le
 * menu").
 *
 * Correctif : en dessous de `sm`, la rangée de droite et les liens de nav
 * disparaissent au profit d'un unique bouton hamburger, qui ouvre un panneau
 * déroulant reprenant les 4 éléments empilés verticalement (même habillage
 * "verre" que le bandeau : fond blanc/95, bordure, flou). Rien ne change à
 * partir de `sm` (comportement desktop identique à avant).
 */
export function MarketingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-30 mt-2 w-full md:mt-5">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative flex h-14 items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white/90 px-3 backdrop-blur-xs">
          <div className="flex flex-1 items-center">
            <Logo />
          </div>

          <ul className="hidden items-center gap-2 sm:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-lg px-3 py-[7px] text-sm font-medium text-gray-600 transition hover:text-gray-900"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <ul className="hidden flex-1 items-center justify-end gap-3 sm:flex">
            <li>
              <Link
                href="/login"
                className="rounded-lg px-3 py-[7px] text-sm font-medium text-gray-600 transition hover:text-gray-900"
              >
                Se connecter
              </Link>
            </li>
            <li>
              <Link
                href="/signup"
                className="rounded-lg bg-indigo-500 px-3 py-[7px] text-sm font-medium text-white transition hover:bg-indigo-400"
              >
                Créer mon compte
              </Link>
            </li>
          </ul>

          {/* Bouton hamburger — visible uniquement sous `sm`, seul élément à
              droite du logo à cette taille (remplace nav + Se connecter +
              Créer mon compte, qui débordaient sinon). */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-100 sm:hidden"
          >
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>

        {open && (
          <div
            id="mobile-menu"
            className="mt-2 rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur-xs sm:hidden"
          >
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Se connecter
                </Link>
              </li>
              <li className="pt-1">
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg bg-indigo-500 px-3 py-2.5 text-center text-sm font-medium text-white transition hover:bg-indigo-400"
                >
                  Créer mon compte
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
