import type { Metadata } from "next";
import { LegalLayout, H2, P, Ul, InternalLink } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation — Qualiopi Pilote",
  description: "Conditions générales d'utilisation de la plateforme Qualiopi Pilote.",
};

export default function CguPage() {
  return (
    <LegalLayout title="Conditions Générales d'Utilisation" updated="21 août 2026">
      <P>
        Les présentes conditions générales d&apos;utilisation (CGU) définissent les règles
        d&apos;accès et d&apos;usage de la plateforme Qualiopi Pilote, éditée par Pivot Formation
        (voir les <InternalLink href="/mentions-legales">mentions légales</InternalLink>). Les
        conditions financières applicables aux abonnements payants sont détaillées dans les{" "}
        <InternalLink href="/cgv">conditions générales de vente</InternalLink>.
      </P>

      <H2>1. Objet</H2>
      <P>
        Qualiopi Pilote est un logiciel d&apos;aide à la préparation d&apos;un dossier de
        certification Qualiopi : questionnaires guidés, génération automatique de documents à
        partir de banques de contenus et, selon la formule souscrite, génération d&apos;un site
        internet et accès à une plateforme de formation en ligne. Le détail des formules
        disponibles figure sur la page <InternalLink href="/tarifs">Tarifs</InternalLink>.
      </P>

      <H2>2. Acceptation des CGU</H2>
      <P>
        La création d&apos;un compte et l&apos;utilisation du Service impliquent l&apos;acceptation
        pleine et entière des présentes CGU. Si vous n&apos;acceptez pas ces conditions, vous ne
        devez pas utiliser le Service.
      </P>

      <H2>3. Compte utilisateur</H2>
      <P>
        L&apos;accès au Service nécessite la création d&apos;un compte (email et mot de passe, ou
        connexion via un compte Google). L&apos;utilisateur s&apos;engage à fournir des
        informations exactes et à jour, et à préserver la confidentialité de ses identifiants.
      </P>
      <P>
        Un compte est rattaché à un unique organisme de formation dès sa création et ne peut ni
        en changer, ni être associé à un second organisme.
      </P>

      <H2>4. Description et limites du Service</H2>
      <P>
        Qualiopi Pilote est un outil d&apos;aide à la préparation. Il repose sur des
        questionnaires, des règles conditionnelles et des banques de contenus prédéfinies, sans
        recours à une intelligence artificielle générative dans son fonctionnement courant. Il
        ne remplace pas l&apos;accompagnement d&apos;un professionnel qualifié et ne garantit en
        aucun cas l&apos;obtention de la certification Qualiopi, seule l&apos;auditeur certificateur
        étant compétent pour se prononcer.
      </P>

      <H2>5. Obligations de l&apos;utilisateur</H2>
      <P>
        L&apos;utilisateur est seul responsable de l&apos;exactitude des informations qu&apos;il
        saisit dans le Service, ainsi que de l&apos;usage qu&apos;il fait des documents générés
        auprès de tiers (financeurs, auditeurs, apprenants, partenaires). Il s&apos;engage à ne
        pas utiliser le Service à des fins illicites ou contraires aux présentes CGU.
      </P>

      <H2>6. Propriété intellectuelle</H2>
      <P>
        Voir la section dédiée des <InternalLink href="/mentions-legales">mentions légales</InternalLink>.
      </P>

      <H2>7. Disponibilité du Service</H2>
      <P>
        Pivot Formation s&apos;efforce d&apos;assurer un accès continu au Service, sans garantie
        de disponibilité absolue. Des interruptions ponctuelles pour maintenance peuvent
        survenir, si possible annoncées à l&apos;avance.
      </P>

      <H2>8. Suspension et suppression de compte</H2>
      <Ul>
        <li>
          Pivot Formation peut suspendre ou résilier l&apos;accès d&apos;un utilisateur en cas de
          non-respect des présentes CGU, de fraude, ou de non-paiement d&apos;un abonnement (voir
          les CGV).
        </li>
        <li>
          L&apos;utilisateur peut demander la suppression de son compte et de ses données à tout
          moment en écrivant à pedagogie@pivotformation.com.
        </li>
      </Ul>

      <H2>9. Responsabilité</H2>
      <P>
        Dans les limites autorisées par la loi, la responsabilité de Pivot Formation ne saurait
        être engagée pour un dommage indirect résultant de l&apos;utilisation du Service, ni pour
        le refus d&apos;une certification Qualiopi ou d&apos;un financement par un tiers.
      </P>

      <H2>10. Modification des CGU</H2>
      <P>
        Pivot Formation peut modifier les présentes CGU à tout moment ; les utilisateurs seront
        informés de toute modification substantielle par email ou lors de leur prochaine
        connexion.
      </P>

      <H2>11. Droit applicable</H2>
      <P>
        Les présentes CGU sont soumises au droit français. Voir les{" "}
        <InternalLink href="/mentions-legales">mentions légales</InternalLink> pour la
        juridiction compétente en cas de litige.
      </P>
    </LegalLayout>
  );
}
