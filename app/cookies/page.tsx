import type { Metadata } from "next";
import { LegalLayout, H2, P, Ul, InternalLink } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Politique de cookies — Qualiopi Pilote",
  description: "Quels cookies utilise Qualiopi Pilote, et pourquoi.",
};

// Contenu volontairement simple : à ce jour l'application n'installe aucun
// outil de mesure d'audience ni de publicité (vérifié dans le code, aucune
// dépendance de ce type au 21/08/2026) — uniquement le cookie de session
// Supabase, strictement nécessaire. À mettre à jour le jour où un outil
// d'analytics est ajouté.
export default function CookiesPage() {
  return (
    <LegalLayout title="Politique de cookies" updated="21 août 2026">
      <H2>1. Qu&apos;est-ce qu&apos;un cookie ?</H2>
      <P>
        Un cookie est un petit fichier déposé sur votre navigateur lors de votre visite d&apos;un
        site, permettant notamment de vous reconnaître d&apos;une page à l&apos;autre ou d&apos;une
        visite à l&apos;autre.
      </P>

      <H2>2. Cookies utilisés par Qualiopi Pilote</H2>
      <P>
        À ce jour, Qualiopi Pilote utilise uniquement un cookie strictement nécessaire au
        fonctionnement du Service : celui qui maintient votre session de connexion (géré par
        Supabase Authentification). Sans ce cookie, il serait impossible de rester connecté à
        votre compte d&apos;une page à l&apos;autre.
      </P>
      <Ul>
        <li>
          Conformément à l&apos;article 82 de la loi Informatique et Libertés, ce cookie strictement
          nécessaire ne requiert pas de recueil de consentement préalable, puisqu&apos;il est
          indispensable à la fourniture du service que vous demandez explicitement (rester
          connecté).
        </li>
        <li>
          Qualiopi Pilote n&apos;utilise, à ce jour, aucun cookie de mesure d&apos;audience, de
          publicité ou de traçage à des fins commerciales.
        </li>
      </Ul>
      <P>
        Cette politique sera mise à jour si cela venait à changer, avec le cas échéant la mise en
        place d&apos;un recueil de consentement adapté.
      </P>

      <H2>3. Gérer les cookies</H2>
      <P>
        Vous pouvez configurer votre navigateur pour refuser les cookies. Cela empêchera
        toutefois le maintien de votre session : vous devrez alors vous reconnecter à chaque
        visite.
      </P>

      <H2>4. En savoir plus</H2>
      <P>
        Pour plus de détails sur les données personnelles traitées par Qualiopi Pilote, voir la{" "}
        <InternalLink href="/confidentialite">politique de confidentialité</InternalLink>.
      </P>
    </LegalLayout>
  );
}
