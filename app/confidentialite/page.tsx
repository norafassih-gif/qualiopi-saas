import type { Metadata } from "next";
import { LegalLayout, H2, P, Ul, InternalLink } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Qualiopi Pilote",
  description: "Comment Qualiopi Pilote collecte, utilise et protège les données personnelles.",
};

export default function ConfidentialitePage() {
  return (
    <LegalLayout title="Politique de confidentialité" updated="21 août 2026">
      <P>
        La présente politique décrit comment Pivot Formation, éditeur de Qualiopi Pilote (voir
        les <InternalLink href="/mentions-legales">mentions légales</InternalLink>), traite les
        données personnelles dans le cadre du Service, conformément au Règlement général sur la
        protection des données (RGPD).
      </P>

      <H2>1. Responsable du traitement</H2>
      <P>
        Pivot Formation, 6 rue James Watt, 93200 Saint-Denis, est responsable du traitement des
        données personnelles collectées via Qualiopi Pilote. Pour toute question relative à vos
        données, vous pouvez écrire à pedagogie@pivotformation.com.
      </P>

      <H2>2. Données collectées</H2>
      <Ul>
        <li>
          <span className="font-semibold text-gray-900">Compte utilisateur</span> : nom, adresse email, mot de
          passe (stocké de façon chiffrée) ou identifiant du compte Google en cas de connexion
          via Google.
        </li>
        <li>
          <span className="font-semibold text-gray-900">Organisme</span> : nom de l&apos;entreprise, nom
          commercial, nom du dirigeant, SIRET, adresse, téléphone, email, logo et couleurs de
          l&apos;identité visuelle.
        </li>
        <li>
          <span className="font-semibold text-gray-900">Formations et sessions</span> : nom des formations,
          informations sur les bénéficiaires (nom, entreprise), dates de session, et toute
          donnée saisie par le client afin de générer ses documents. Ces informations concernent
          les propres apprenants du client : celui-ci reste responsable du traitement de ces
          données vis-à-vis d&apos;eux, Pivot Formation agissant en tant que sous-traitant au
          sens du RGPD pour leur hébergement technique.
        </li>
        <li>
          <span className="font-semibold text-gray-900">Facturation</span> : gérée directement par Stripe.
          Pivot Formation ne collecte ni ne stocke aucune donnée de carte bancaire.
        </li>
      </Ul>

      <H2>3. Finalités du traitement</H2>
      <P>
        Ces données sont utilisées pour : fournir le Service et générer les documents demandés,
        gérer le compte et l&apos;abonnement du client, assurer le support client, améliorer le
        Service, et respecter les obligations légales et comptables de Pivot Formation.
      </P>

      <H2>4. Base légale</H2>
      <P>
        Les traitements reposent sur l&apos;exécution du contrat liant le client à Pivot
        Formation (voir les{" "}
        <InternalLink href="/cgu">CGU</InternalLink> et les{" "}
        <InternalLink href="/cgv">CGV</InternalLink>), sur l&apos;intérêt légitime de Pivot
        Formation (sécurité, amélioration du Service) et, ponctuellement, sur le respect
        d&apos;obligations légales (comptabilité notamment).
      </P>

      <H2>5. Sous-traitants et hébergement</H2>
      <P>Le Service s&apos;appuie sur les prestataires suivants pour fonctionner :</P>
      <Ul>
        <li>Supabase, Inc. — base de données, authentification, stockage des fichiers générés.</li>
        <li>Vercel Inc. — hébergement de l&apos;application.</li>
        <li>Stripe — traitement des paiements et de la facturation.</li>
        <li>Google — connexion au compte via « Se connecter avec Google », le cas échéant.</li>
      </Ul>
      <P>
        Ces prestataires peuvent héberger des données en dehors de l&apos;Union européenne ; ils
        s&apos;engagent, par leurs propres conditions contractuelles, au respect de garanties
        équivalentes au RGPD (notamment via des clauses contractuelles types).
      </P>

      <H2>6. Durée de conservation</H2>
      <P>
        Les données sont conservées pendant la durée de l&apos;abonnement, puis pendant la durée
        nécessaire au respect des obligations légales et comptables applicables, avant
        suppression ou anonymisation.
      </P>

      <H2>7. Vos droits</H2>
      <P>
        Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification,
        d&apos;effacement, de limitation, d&apos;opposition et de portabilité de vos données, ainsi
        que du droit d&apos;introduire une réclamation auprès de la CNIL (
        <a href="https://www.cnil.fr" className="text-indigo-700 underline underline-offset-2 hover:text-indigo-900">
          cnil.fr
        </a>
        ). Ces droits s&apos;exercent en écrivant à pedagogie@pivotformation.com.
      </P>

      <H2>8. Sécurité</H2>
      <P>
        Pivot Formation met en œuvre des mesures techniques et organisationnelles raisonnables
        pour protéger les données : authentification sécurisée, et cloisonnement strict des
        données de chaque organisme via des règles d&apos;accès au niveau de la base de données,
        garantissant qu&apos;un client ne peut jamais voir les données d&apos;un autre.
      </P>

      <H2>9. Cookies</H2>
      <P>
        L&apos;utilisation des cookies est décrite dans la{" "}
        <InternalLink href="/cookies">politique de cookies</InternalLink>.
      </P>
    </LegalLayout>
  );
}
