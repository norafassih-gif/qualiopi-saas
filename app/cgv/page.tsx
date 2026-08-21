import type { Metadata } from "next";
import { LegalLayout, H2, P, Ul, TODO, InternalLink } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente — Qualiopi Pilote",
  description: "Conditions générales de vente des abonnements Qualiopi Pilote.",
};

export default function CgvPage() {
  return (
    <LegalLayout title="Conditions Générales de Vente" updated="21 août 2026">
      <P>
        <TODO>
          Page la plus sensible juridiquement de tout le site : elle encadre un paiement
          récurrent, un engagement de 12 mois et l&apos;absence de résiliation en libre-service.
          À faire relire par un professionnel du droit avant toute mise en ligne définitive,
          en particulier les articles 4 et 5 ci-dessous.
        </TODO>
      </P>

      <H2>1. Champ d&apos;application</H2>
      <P>
        Les présentes conditions générales de vente (CGV) s&apos;appliquent à tout abonnement
        souscrit auprès de Pivot Formation (voir les{" "}
        <InternalLink href="/mentions-legales">mentions légales</InternalLink>) pour
        l&apos;utilisation de la plateforme Qualiopi Pilote, entre Pivot Formation et tout client
        agissant à titre professionnel, dans le cadre de la création ou de la gestion de son
        organisme de formation.
      </P>

      <H2>2. Offres et tarifs</H2>
      <P>
        Les formules disponibles ainsi que l&apos;option « Logo + charte graphique » sont
        décrites, avec leur tarif en vigueur, sur la page{" "}
        <InternalLink href="/tarifs">Tarifs</InternalLink>. Une prestation d&apos;accompagnement
        Qualiopi sur mesure est proposée séparément, sur devis. Les tarifs affichés
        s&apos;entendent hors taxes le cas échéant applicables. Pivot Formation peut modifier ses
        tarifs à tout moment ; toute modification ne s&apos;applique pas à un abonnement en cours
        avant son prochain renouvellement, sauf information préalable du client.
      </P>

      <H2>3. Commande et paiement</H2>
      <P>
        La souscription s&apos;effectue en ligne via la plateforme de paiement sécurisée Stripe.
        Pivot Formation ne collecte ni ne conserve aucune donnée bancaire : celles-ci sont
        traitées exclusivement par Stripe. Le paiement est prélevé par abonnement mensuel, à la
        date anniversaire de la souscription, jusqu&apos;à résiliation dans les conditions de
        l&apos;article 5.
      </P>

      <H2>4. Durée et renouvellement</H2>
      <P>
        Sauf mention contraire indiquée au moment de la souscription, l&apos;abonnement est
        souscrit pour une durée minimale de 12 mois, reconduite ensuite tacitement par périodes
        successives de même durée, sauf résiliation par le client dans les conditions de
        l&apos;article 5.
      </P>
      <P>
        <TODO>
          Si un client pouvait être qualifié de « consommateur » ou de « non-professionnel » au
          sens du Code de la consommation, l&apos;article L. 215-1 impose de le prévenir de la
          possibilité de ne pas reconduire son contrat, dans un délai précis avant l&apos;échéance
          — cette clause doit être vérifiée et, si nécessaire, complétée en conséquence avant
          mise en ligne définitive.
        </TODO>
      </P>

      <H2>5. Résiliation</H2>
      <P>
        À la différence d&apos;un abonnement résiliable en ligne à tout moment, la résiliation
        d&apos;un abonnement Qualiopi Pilote s&apos;effectue exclusivement sur demande écrite
        auprès de pedagogie@pivotformation.com, au moins{" "}
        <TODO>[délai de préavis à définir, ex. 30 ou 60 jours]</TODO> avant l&apos;échéance de la
        période d&apos;engagement en cours.
      </P>
      <P>
        Pivot Formation peut résilier un abonnement de plein droit en cas de non-paiement, après
        mise en demeure par email restée sans effet pendant 15 jours.
      </P>

      <H2>6. Droit de rétractation</H2>
      <P>
        Le Service étant réservé à des professionnels dans le cadre de leur activité, le droit
        de rétractation prévu par le Code de la consommation pour les contrats conclus à
        distance ne s&apos;applique pas aux présentes CGV.
      </P>

      <H2>7. Responsabilité et garanties</H2>
      <P>
        Pivot Formation met en œuvre les moyens nécessaires pour assurer la disponibilité et la
        qualité du Service, sans garantir de résultat quant à l&apos;obtention de la certification
        Qualiopi par le client. Voir également les{" "}
        <InternalLink href="/cgu">conditions générales d&apos;utilisation</InternalLink>.
      </P>

      <H2>8. Données personnelles</H2>
      <P>
        Le traitement des données personnelles dans le cadre de la souscription et de la
        facturation est décrit dans la{" "}
        <InternalLink href="/confidentialite">politique de confidentialité</InternalLink>.
      </P>

      <H2>9. Litiges</H2>
      <P>
        Les présentes CGV sont soumises au droit français. À défaut de résolution amiable, tout
        litige relève des tribunaux compétents du ressort du siège social de Pivot Formation.
      </P>

      <Ul>
        <li>
          <P>
            Autres liens utiles :{" "}
            <InternalLink href="/mentions-legales">mentions légales</InternalLink>,{" "}
            <InternalLink href="/cgu">CGU</InternalLink>,{" "}
            <InternalLink href="/confidentialite">politique de confidentialité</InternalLink>,{" "}
            <InternalLink href="/cookies">politique de cookies</InternalLink>.
          </P>
        </li>
      </Ul>
    </LegalLayout>
  );
}
