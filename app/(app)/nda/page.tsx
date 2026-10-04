import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { CheckCircle2, Circle, ExternalLink, ArrowRight, Info } from "lucide-react";
import { getMyOrganization } from "@/lib/actions/organization";
import { getMyFirstTraining } from "@/lib/actions/training";
import { getMyFirstSession } from "@/lib/actions/session";
import { toggleNdaStep, saveNdaInfo, chooseTrack } from "@/lib/actions/track";
import {
  NDA_STEPS,
  NDA_LINKS,
  NDA_REVENUE_THRESHOLD,
  NSF_BY_CATEGORY,
  legalFormInfo,
  splitSiret,
  statusDetailsText,
} from "@/lib/engine/tracks";
import { LegalFormSelect } from "@/components/ui/legal-form-select";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CopyValue } from "./copy-value";

export const dynamic = "force-dynamic";

function frDate(iso: string | null | undefined) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-");
  return d && m && y ? `${d}/${m}/${y}` : iso;
}

function Missing({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Link href={href} className="text-sm text-amber-700 underline">
      {children}
    </Link>
  );
}

/** Une ligne « champ du formulaire officiel → valeur / où la trouver ». */
function Row({ label, children, hint }: { label: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-gray-100 py-3 sm:grid-cols-[220px_1fr]">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <div className="text-sm text-gray-800">
        {children}
        {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
      </div>
    </div>
  );
}

function OfficialLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-sm font-medium text-blue-900 underline"
    >
      {children}
      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
    </a>
  );
}

/** Pièce justificative : générée par le logiciel, ou à fournir par le client. */
function Piece({ title, status, children }: { title: string; status: "generated" | "soon" | "user"; children?: ReactNode }) {
  const badge =
    status === "generated"
      ? { text: "Générée par le logiciel", cls: "bg-green-50 text-green-800" }
      : status === "soon"
      ? { text: "Génération automatique en préparation", cls: "bg-blue-50 text-blue-800" }
      : { text: "À fournir par vous", cls: "bg-amber-50 text-amber-800" };
  return (
    <li className="rounded-md border border-gray-200 bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <span className={`rounded-full px-2 py-0.5 text-xs ${badge.cls}`}>{badge.text}</span>
      </div>
      {children ? <div className="mt-1 text-xs text-gray-600">{children}</div> : null}
    </li>
  );
}

function StepDone({ stepKey, done }: { stepKey: string; done: boolean }) {
  return (
    <form action={toggleNdaStep}>
      <input type="hidden" name="step" value={stepKey} />
      <button
        type="submit"
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${
          done ? "bg-green-50 text-green-800 hover:bg-green-100" : "bg-blue-900 text-white hover:bg-blue-800"
        }`}
      >
        {done ? (
          <>
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Étape faite
          </>
        ) : (
          "Marquer comme fait"
        )}
      </button>
    </form>
  );
}

function Step({
  stepKey,
  progress,
  children,
  intro,
}: {
  stepKey: string;
  progress: Record<string, boolean>;
  children: ReactNode;
  intro?: ReactNode;
}) {
  const step = NDA_STEPS.find((s) => s.key === stepKey)!;
  const done = Boolean(progress[stepKey]);
  return (
    <section id={stepKey} className="scroll-mt-6 rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          {done ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />
          ) : (
            <Circle className="h-5 w-5 text-gray-300" aria-hidden="true" />
          )}
          {step.title}
        </h2>
        <StepDone stepKey={stepKey} done={done} />
      </div>
      {intro ? <p className="mt-2 text-sm text-gray-600">{intro}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default async function NdaPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const org = await getMyOrganization();
  if (!org) redirect("/onboarding/parcours");
  if (!org.onboarding_company_completed) redirect("/onboarding/entreprise");

  const training = await getMyFirstTraining();
  const session = training ? await getMyFirstSession() : null;

  const progress = (org.nda_progress ?? {}) as Record<string, boolean>;
  const doneCount = NDA_STEPS.filter((s) => progress[s.key]).length;
  const percent = Math.round((doneCount / NDA_STEPS.length) * 100);

  const legal = legalFormInfo(org.legal_form);
  const { siren, nic } = splitSiret(org.siret);
  const year = new Date().getFullYear();
  const nsf = training ? NSF_BY_CATEGORY[training.category_id] : null;
  const sole = org.is_sole_practitioner;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">Ma déclaration d&apos;activité (NDA)</h1>
      <p className="mt-1 text-sm text-gray-600">
        Suivez les étapes dans l&apos;ordre exact du formulaire officiel Mon Activité Formation. Pour
        chaque champ, vous trouvez la valeur à recopier ou l&apos;endroit où la trouver.
      </p>

      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-800">Progression</span>
          <span className="text-gray-600">
            {doneCount} / {NDA_STEPS.length} étapes
          </span>
        </div>
        <ProgressBar value={percent} />
        <nav className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {NDA_STEPS.map((s) => (
            <a key={s.key} href={`#${s.key}`} className={progress[s.key] ? "text-green-700" : "text-blue-900 underline"}>
              {s.title}
            </a>
          ))}
        </nav>
      </div>

      {params.saved ? (
        <p className="mt-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">Enregistré.</p>
      ) : null}
      {params.error ? (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">L&apos;enregistrement a échoué. Réessayez.</p>
      ) : null}

      <div className="mt-6 space-y-5">
        {/* ÉTAPE 0 */}
        <Step progress={progress} stepKey="avant" intro="Trois conditions avant d'ouvrir le formulaire officiel.">
          <ul className="space-y-3 text-sm text-gray-800">
            <li>
              <strong>Créer votre compte</strong> sur Mon Activité Formation, le site du ministère du
              Travail où se dépose la déclaration.{" "}
              <OfficialLink href={NDA_LINKS.maf}>Ouvrir Mon Activité Formation</OfficialLink>
            </li>
            <li>
              <strong>Avoir signé une première convention ou un premier contrat de formation</strong>{" "}
              avec un client : la déclaration se fait après cette signature, avec ce document.{" "}
              {training && session ? (
                <span className="text-green-700">Votre formation et votre session sont renseignées.</span>
              ) : (
                <Missing href={training ? "/onboarding/session" : "/onboarding/activite"}>
                  Renseigner ma formation et ma première session
                </Missing>
              )}
            </li>
            <li>
              <strong>Indiquer votre forme juridique</strong> : elle détermine plusieurs réponses et
              justificatifs.
              <form action={saveNdaInfo} className="mt-2 flex flex-wrap items-end gap-3">
                <input type="hidden" name="anchor" value="avant" />
                <div className="min-w-64">
                  <LegalFormSelect defaultValue={org.legal_form} />
                </div>
                <button type="submit" className="rounded-md bg-gray-900 px-3 py-2 text-sm text-white">
                  Enregistrer
                </button>
              </form>
            </li>
          </ul>
        </Step>

        {/* ÉTAPE 1 */}
        <Step progress={progress} stepKey="declarant" intro="Identité de votre structure. Tout se trouve sur votre avis de situation Sirene.">
          <Row label="Siège social à l'étranger ?">
            <CopyValue value="Non" />
          </Row>
          <Row label="Numéro SIREN" hint="Les 9 premiers chiffres de votre SIRET.">
            {siren ? <CopyValue value={siren} /> : <Missing href="/parametres/entreprise">Renseigner mon SIRET</Missing>}
          </Row>
          <Row label="Numéro d'établissement" hint="Les 5 derniers chiffres de votre SIRET (aussi appelé NIC).">
            {nic ? <CopyValue value={nic} /> : <Missing href="/parametres/entreprise">Renseigner mon SIRET</Missing>}
          </Row>
          <Row label="Dénomination" hint="Le nom exact inscrit au répertoire Sirene (pour une micro-entreprise, c'est votre nom et prénom).">
            <CopyValue value={org.company_name} />
          </Row>
          <Row label="Code NAF" hint="Indiqué sur votre avis de situation Sirene (ex. 8559A Formation continue d'adultes).">
            <OfficialLink href={NDA_LINKS.sirene}>Télécharger mon avis de situation Sirene</OfficialLink>
          </Row>
          <Row
            label="Justificatif d'attribution du SIREN"
            hint="Sur le site de l'Insee, saisissez votre SIRET puis téléchargez l'avis de situation en PDF. C'est gratuit et immédiat."
          >
            <OfficialLink href={NDA_LINKS.sirene}>Avis de situation au répertoire Sirene</OfficialLink>
          </Row>
          <Row label="Copie de la pièce d'identité" hint="Pièce d'identité du dirigeant en cours de validité, en PDF. Le logiciel ne la conserve pas.">
            À scanner vous-même
          </Row>
          <Row label="Adresse">
            {org.address ? <CopyValue value={org.address} /> : <Missing href="/parametres/entreprise">Renseigner mon adresse</Missing>}
          </Row>
          <Row label="Téléphone">
            {org.phone ? <CopyValue value={org.phone} /> : <Missing href="/parametres/entreprise">Renseigner mon téléphone</Missing>}
          </Row>
          <Row label="E-mail de contact">
            {org.email ? <CopyValue value={org.email} /> : <Missing href="/parametres/entreprise">Renseigner mon e-mail</Missing>}
          </Row>
        </Step>

        {/* ÉTAPE 2 */}
        <Step progress={progress} stepKey="statut" intro="Votre statut juridique.">
          <Row label="Statut" hint="Choisissez dans la liste du formulaire la catégorie qui correspond à votre forme juridique (indiquée sur l'avis de situation Sirene).">
            {legal ? <strong>{legal.label}</strong> : <Missing href="#avant">Indiquer ma forme juridique</Missing>}
          </Row>
          <Row label="Précisions sur le statut" hint="Texte proposé, à copier tel quel.">
            <CopyValue value={statusDetailsText(org.legal_form, org.company_name, org.siret)} />
          </Row>
        </Step>

        {/* ÉTAPE 3 */}
        <Step progress={progress} stepKey="activite" intro="Votre exercice comptable, votre première convention et les pièces décrivant vos formations.">
          <Row label="Date de signature de la convention ou du contrat" hint="La date figurant en bas de la convention ou du contrat signé avec votre premier client.">
            {session?.start_date ? (
              <span>Votre première session débute le {frDate(session.start_date)} : la signature doit être antérieure.</span>
            ) : (
              <Missing href="/onboarding/session">Renseigner ma première session</Missing>
            )}
          </Row>
          <Row label="Intitulé de la formation">
            {training ? <CopyValue value={training.name} /> : <Missing href="/onboarding/activite">Créer ma formation</Missing>}
          </Row>
          <Row
            label="Exercice comptable"
            hint={legal?.calendarYear ? "Les micro-entrepreneurs clôturent obligatoirement au 31 décembre." : "Reprenez les dates de votre exercice (votre expert-comptable vous les donne). Le premier exercice peut être plus court ou plus long."}
          >
            {legal?.calendarYear ? (
              <span className="flex flex-wrap gap-3">
                <span>Début : <CopyValue value={`01/01/${year}`} /></span>
                <span>Fin : <CopyValue value={`31/12/${year}`} /></span>
              </span>
            ) : (
              "Selon vos statuts"
            )}
          </Row>
          <Row label="Ancien numéro de déclaration d'activité" hint="Seulement si vous avez déjà eu un NDA par le passé. Sinon laissez vide.">
            Facultatif
          </Row>
          <Row label={`Chiffre d'affaires supérieur à ${NDA_REVENUE_THRESHOLD} ?`} hint="Votre réponse change les pièces demandées par le formulaire.">
            <form action={saveNdaInfo} className="flex flex-wrap items-center gap-4">
              <input type="hidden" name="anchor" value="activite" />
              {(["non", "oui"] as const).map((v) => (
                <label key={v} className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="nda_revenue_over_threshold"
                    value={v}
                    defaultChecked={org.nda_revenue_over_threshold === (v === "oui")}
                  />
                  {v === "oui" ? "Oui" : "Non"}
                </label>
              ))}
              <button type="submit" className="rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white">
                Enregistrer
              </button>
            </form>
          </Row>

          <p className="mt-4 text-sm font-medium text-gray-900">Pièces justificatives à déposer à cette étape</p>
          <ul className="mt-2 space-y-2">
            {org.nda_revenue_over_threshold !== true && (
              <Piece title="Description succincte de l'activité" status="soon">
                Demandée quand votre chiffre d&apos;affaires ne dépasse pas {NDA_REVENUE_THRESHOLD}.
              </Piece>
            )}
            <Piece title="Convention ou contrat de formation" status="generated">
              Dans <Link href="/documents" className="underline">Mes documents</Link> : « Convention de formation » si un
              tiers finance, « Contrat de formation (particulier) » si la personne paie elle-même. Déposez la
              version signée par les deux parties.
            </Piece>
            <Piece title="Contenu des actions de formation" status="generated">
              C&apos;est votre « Programme de formation », dans <Link href="/documents" className="underline">Mes documents</Link>.
            </Piece>
            <Piece title="Organisation des actions de formation" status="soon" />
            <Piece title="Moyens pédagogiques mobilisés" status="soon" />
            <Piece title="Moyens techniques mobilisés" status="soon" />
          </ul>
        </Step>

        {/* ÉTAPE 4 */}
        <Step progress={progress} stepKey="formateurs" intro="Les personnes qui dispensent les heures de formation à la date de la déclaration.">
          {sole ? (
            <div className="mb-2 flex gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-900">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                Vous êtes seul(e) à former : indiquez <strong>1</strong> dans la ligne qui correspond à votre statut et{" "}
                <strong>0</strong> partout ailleurs. Total : <strong>1</strong>. Sous-traitance : <strong>0</strong>.
              </span>
            </div>
          ) : null}
          <Row
            label="Travailleurs indépendants / gérants non-salariés"
            hint="Micro-entrepreneur, entrepreneur individuel, gérant majoritaire de SARL ou EURL : c'est cette ligne. Président(e) de SAS ou SASU rémunéré(e) : vérifiez avec votre expert-comptable si vous êtes assimilé(e) salarié(e)."
          >
            {sole && ["micro_entreprise", "ei", "eurl", "sarl"].includes(org.legal_form ?? "") ? <CopyValue value="1" /> : "Selon votre situation"}
          </Row>
          <Row label="Salariés CDI / CDD, occasionnels, bénévoles">{sole ? <CopyValue value="0" /> : "Selon votre équipe"}</Row>
          <Row label="Personnes extérieures (sous-traitance)">{sole ? <CopyValue value="0" /> : "Nombre de formateurs sous-traitants"}</Row>

          <p className="mt-4 text-sm font-medium text-gray-900">Pièces justificatives</p>
          <ul className="mt-2 space-y-2">
            <Piece title="Liste des formateurs" status="soon" />
            <Piece title="Documents justificatifs" status="user">
              CV à jour et copies des diplômes de chaque formateur.
            </Piece>
            <Piece title="Documents contractuels" status="soon">
              Preuve du lien entre chaque formateur et l&apos;organisme
              {legal ? ` (pour vous : ${legal.registrationProof.toLowerCase()})` : ""}.
            </Piece>
          </ul>
        </Step>

        {/* ÉTAPE 5 */}
        <Step progress={progress} stepKey="formations" intro="Le domaine de vos formations.">
          <Row label="Spécialité" hint="Code proposé à partir de votre domaine de formation. Choisissez-le dans la liste du formulaire.">
            {nsf ? <CopyValue value={nsf} /> : <Missing href="/onboarding/activite">Choisir mon domaine de formation</Missing>}
          </Row>
          <Row label="Précisions éventuelles" hint="Une phrase qui décrit votre formation et son public.">
            {training ? <CopyValue value={training.name} /> : "Intitulé de votre formation"}
          </Row>
        </Step>

        {/* ÉTAPE 6 */}
        <Step progress={progress} stepKey="responsables" intro="Les personnes qui dirigent ou administrent la structure.">
          <Row label="Nom et prénom">
            {org.manager_name ? <CopyValue value={org.manager_name} /> : <Missing href="/parametres/entreprise">Renseigner le dirigeant</Missing>}
          </Row>
          <Row label="Qualité">{legal ? <CopyValue value={legal.managerTitle} /> : <Missing href="#avant">Indiquer ma forme juridique</Missing>}</Row>
          <Row
            label="Bulletin n°3 du casier judiciaire"
            hint="Demande en ligne gratuite. Remplissez votre état civil : le bulletin arrive en général très vite par e-mail, en PDF, à déposer tel quel."
          >
            <OfficialLink href={NDA_LINKS.casier}>Demander mon bulletin n°3</OfficialLink>
          </Row>
        </Step>

        {/* ÉTAPE 7 */}
        <Step progress={progress} stepKey="signataire" intro="La personne qui signe la déclaration.">
          <Row label="Le signataire est-il l'un des responsables juridiques ?">
            <CopyValue value="Oui" />
          </Row>
          <Row label="Nom, prénom, qualité">
            {org.manager_name ? <CopyValue value={org.manager_name} /> : "Le dirigeant"}
            {legal ? <span className="ml-2 text-gray-600">({legal.managerTitle})</span> : null}
          </Row>
          <Row label="Lieu" hint="La ville du siège.">
            {org.organization_city ? <CopyValue value={org.organization_city} /> : <Missing href="/parametres/qualite">Renseigner ma ville</Missing>}
          </Row>
          <Row label="Certification sur l'honneur">Cochez la case « Je certifie sur l&apos;honneur l&apos;exactitude des informations ».</Row>
        </Step>

        {/* ÉTAPE 8 */}
        <Step progress={progress} stepKey="suspensions" intro="Rien à remplir pour une première déclaration : cette rubrique est tenue par l'administration.">
          <p className="text-sm text-gray-700">Vérifiez une dernière fois chaque rubrique, puis envoyez votre déclaration.</p>
        </Step>

        {/* APRÈS LE DÉPÔT */}
        <Step progress={progress} stepKey="depot" intro="La DREETS instruit votre dossier. Notez ici la date de dépôt, puis votre numéro dès que vous le recevez.">
          <form action={saveNdaInfo} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <input type="hidden" name="anchor" value="depot" />
            <label className="flex flex-col gap-1 text-sm">
              Date de dépôt
              <input type="date" name="nda_filed_on" defaultValue={org.nda_filed_on ?? ""} className="rounded-md border border-gray-300 px-3 py-2" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Numéro de déclaration d&apos;activité reçu
              <input
                type="text"
                name="nda_number"
                defaultValue={org.nda_number ?? ""}
                placeholder="11 chiffres"
                className="rounded-md border border-gray-300 px-3 py-2"
              />
            </label>
            <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white">
              Enregistrer
            </button>
          </form>
          {org.nda_number ? (
            <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-medium text-green-900">
                Félicitations, votre numéro {org.nda_number} est enregistré.
              </p>
              <p className="mt-1 text-sm text-green-800">
                Prochaine étape : préparer votre certification Qualiopi. Toutes les informations déjà saisies sont conservées.
              </p>
              <form action={chooseTrack} className="mt-3">
                <input type="hidden" name="track" value="qualiopi_initial" />
                <button type="submit" className="inline-flex items-center gap-1.5 rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-white">
                  Préparer mon audit Qualiopi
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
            </div>
          ) : null}
        </Step>
      </div>
    </div>
  );
}
