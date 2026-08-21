import type { Metadata } from "next";
import { LegalLayout, H2, P, Ul, TODO, InternalLink } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Mentions légales — Qualiopi Pilote",
  description: "Mentions légales du site et du logiciel Qualiopi Pilote, édité par Pivot Formation.",
};

// Contenu rédigé à partir des informations publiques déjà utilisées par Nora
// dans ses propres documents Qualiopi (SIRET, NDA, adresse, contact) —
// cf. claude/journal-avancement.md. Les points encore incertains (forme
// juridique exacte, capital social, RCS, TVA) sont signalés en <TODO> :
// PAS de conseil juridique personnalisé ici, juste un premier jet à faire
// valider/compléter par Nora, idéalement avec un professionnel du droit
// avant une mise en ligne définitive.
export default function MentionsLegalesPage() {
  return (
    <LegalLayout title="Mentions légales" updated="21 août 2026">
      <P>
        Le site accessible à l&apos;adresse qualiopi.pivotformation.com et le logiciel
        Qualiopi Pilote (ci-après « le Service ») sont édités par Pivot Formation.
      </P>

      <H2>Éditeur</H2>
      <Ul>
        <li>Nom commercial : Pivot Formation</li>
        <li>
          Forme juridique : <TODO>[à confirmer par Nora — EI, EURL, SARL, SASU…]</TODO>
          {" "}— capital social : <TODO>[à compléter si société à capital]</TODO>
        </li>
        <li>Siège social : 6 rue James Watt, 93200 Saint-Denis, France</li>
        <li>SIRET : 891 291 999 00029</li>
        <li>
          RCS / SIREN : <TODO>[891 291 999 — ville d&apos;immatriculation à confirmer, ex. RCS Bobigny, uniquement si Pivot Formation est immatriculée au RCS]</TODO>
        </li>
        <li>
          TVA : <TODO>[à confirmer — soit un numéro de TVA intracommunautaire, soit la mention « TVA non applicable, art. 293 B du CGI » en cas de franchise en base]</TODO>
        </li>
        <li>
          Organisme de formation certifié Qualiopi — déclaration d&apos;activité enregistrée
          sous le numéro 11931122693 auprès de la Préfecture de la région Île-de-France
        </li>
        <li>Téléphone : +33 6 68 69 33 33</li>
        <li>Email : pedagogie@pivotformation.com</li>
      </Ul>
      <P>Directeur de la publication : Mme Nora Fassih, Gérante.</P>

      <H2>Hébergement</H2>
      <P>Le Service est hébergé par :</P>
      <Ul>
        <li>
          Vercel Inc. (hébergement de l&apos;application) —{" "}
          <a href="https://vercel.com" className="text-indigo-300 underline underline-offset-2 hover:text-indigo-200">
            vercel.com
          </a>
        </li>
        <li>
          Supabase, Inc. (base de données, authentification, stockage des fichiers) —{" "}
          <a href="https://supabase.com" className="text-indigo-300 underline underline-offset-2 hover:text-indigo-200">
            supabase.com
          </a>
        </li>
      </Ul>
      <P>
        <TODO>
          Adresses postales de ces hébergeurs à vérifier sur leurs propres pages de mentions
          légales avant publication définitive — non reproduites ici par prudence, faute de
          certitude sur leur exactitude actuelle.
        </TODO>
      </P>

      <H2>Propriété intellectuelle</H2>
      <P>
        L&apos;ensemble des éléments du Service — structure, moteur de génération de documents,
        modèles de documents, banques de contenus, textes, code source et charte graphique —
        est protégé par le droit de la propriété intellectuelle et reste la propriété exclusive
        de Pivot Formation, sauf mention contraire. Toute reproduction, représentation,
        modification ou exploitation totale ou partielle sans autorisation écrite préalable est
        interdite.
      </P>
      <P>
        Les documents générés à partir des informations propres à chaque client (nom de son
        organisme, contenu de ses formations, données de ses sessions) lui appartiennent une
        fois générés. Les modèles, textes prédéfinis et le moteur qui les produisent restent la
        propriété de Pivot Formation.
      </P>

      <H2>Données personnelles</H2>
      <P>
        Le traitement des données personnelles collectées via le Service est décrit dans la{" "}
        <InternalLink href="/confidentialite">politique de confidentialité</InternalLink>.
      </P>

      <H2>Limitation de responsabilité</H2>
      <P>
        Qualiopi Pilote est un outil d&apos;aide à la préparation d&apos;un dossier Qualiopi. Il ne
        constitue ni un conseil juridique, ni une garantie d&apos;obtention de la certification
        Qualiopi, la décision revenant exclusivement à l&apos;organisme certificateur et à
        l&apos;auditeur missionné. Pivot Formation met tout en œuvre pour assurer l&apos;exactitude
        des contenus proposés, sans pouvoir être tenue responsable d&apos;une erreur, d&apos;une
        omission ou d&apos;un refus de certification par un tiers.
      </P>

      <H2>Droit applicable</H2>
      <P>
        Les présentes mentions légales sont soumises au droit français. À défaut de résolution
        amiable, tout litige relève des tribunaux compétents du ressort du siège social de Pivot
        Formation.
      </P>
    </LegalLayout>
  );
}
