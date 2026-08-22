import Link from "next/link";
import {
  Building2,
  GraduationCap,
  FileText,
  Globe,
  CheckCircle2,
  Circle,
  ArrowRight,
  Palette,
  ClipboardList,
  Settings,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { redirect } from "next/navigation";
import { getMyOrganization } from "@/lib/actions/organization";
import { requireActiveSubscription, getMyBilling } from "@/lib/actions/billing";
import { getMyFirstTraining } from "@/lib/actions/training";
import { getMyFirstSession } from "@/lib/actions/session";
import { listCategoryQuestions, getMyAnswers } from "@/lib/actions/questions";
import { listDocumentTemplatesWithStatus } from "@/lib/actions/documents";
import { isPlatformAdmin } from "@/lib/actions/admin";
import { getPendingAccessGrant } from "@/lib/actions/access-grants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { AccessGrantBanner } from "@/components/ui/access-grant-banner";

export default async function DashboardPage() {
  // Paiement obligatoire avant d'accéder au logiciel (décision de Nora,
  // 21/08/2026) : redirige vers /onboarding/abonnement si l'abonnement
  // n'est pas actif (y compris s'il n'existe encore aucun organisme).
  await requireActiveSubscription();

  const org = await getMyOrganization();

  // Garde-fou défensif : ne devrait plus se produire après
  // requireActiveSubscription() ci-dessus.
  if (!org) {
    redirect("/onboarding/entreprise");
  }
  // Abonnement actif mais formulaire "Mon entreprise" pas encore rempli
  // (organisme encore au stade "placeholder" créé par startCheckout).
  if (!org.onboarding_company_completed) {
    redirect("/onboarding/entreprise");
  }

  const training = await getMyFirstTraining();
  const session = training ? await getMyFirstSession() : null;

  // Thématiques pédagogiques : seulement pour les catégories dont la banque
  // de contenu a été importée (Community Management pour l'instant) — les
  // autres n'ont simplement aucune question ici, donc rien à afficher.
  const themeQuestions = training
    ? await listCategoryQuestions(training.category_id, "activite")
    : [];
  const themeAnswers = training && themeQuestions.length > 0 ? await getMyAnswers(training.id) : {};
  const themesAnswered =
    themeQuestions.length > 0 && themeQuestions.every((q) => themeAnswers[q.id] !== undefined);
  const themesApplicable = themeQuestions.length > 0;

  // Lien back-office (cf. migration 0034) — visible uniquement pour les
  // comptes ayant le statut "administrateur plateforme", pas pour les
  // futurs clients du SaaS.
  const isAdmin = await isPlatformAdmin();
  const pendingAccessGrant = await getPendingAccessGrant();
  const billing = await getMyBilling();

  // Progression "Formation" : création + (thématiques si applicable) + session.
  const formationSteps = [Boolean(training), !themesApplicable || themesAnswered, Boolean(session)];
  const formationPercent = Math.round(
    (formationSteps.filter(Boolean).length / formationSteps.length) * 100
  );

  // Progression "Documents" : uniquement calculable une fois formation + session prêtes.
  let documentsPercent = 0;
  let documentsGenerated = 0;
  let documentsTotal = 0;
  if (training && session) {
    const templates = await listDocumentTemplatesWithStatus();
    if (!("error" in templates)) {
      documentsTotal = templates.length;
      documentsGenerated = templates.filter((t) => t.generated).length;
      documentsPercent = documentsTotal > 0 ? Math.round((documentsGenerated / documentsTotal) * 100) : 0;
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl text-gray-900">
          <span className="font-extrabold">Bonjour</span>{" "}
          <span className="font-light text-gray-500">— {org.company_name}</span>
        </h1>
      </div>

      {pendingAccessGrant && <AccessGrantBanner grant={pendingAccessGrant} />}

      {/*
        Accès LMS (campus.pivotformation.com) — demande de Nora (24/08/2026) :
        compte créé automatiquement au paiement de la formule "tout_compris"
        (cf. webhook Stripe + lib/integrations/campus-lms.ts). Affiché
        uniquement quand le lien existe réellement : pas de message
        "en cours" avant que Nora ait configuré l'intégration côté serveur,
        pour ne pas laisser croire à un client payant que quelque chose est
        cassé alors que le provisioning n'a simplement pas encore eu lieu.
      */}
      {billing?.plan === "tout_compris" && org.campus_setup_link && (
        <div className="mb-8 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
          <p className="text-sm font-medium text-indigo-900">Votre espace LMS est prêt</p>
          <p className="mt-1 text-sm text-indigo-800">
            Cliquez sur le lien ci-dessous pour définir votre mot de passe et accéder à votre
            plateforme de formation en ligne (campus.pivotformation.com).
          </p>
          <a
            href={org.campus_setup_link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white"
          >
            Activer mon accès LMS
          </a>
        </div>
      )}

      {/* Progression d'ensemble */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="mb-3 flex items-center gap-2 text-gray-500">
            <Building2 className="h-4 w-4" aria-hidden="true" />
            <p className="text-xs font-medium uppercase tracking-wide">Organisme</p>
          </div>
          <p className="mb-2 text-2xl font-semibold text-gray-900">100 %</p>
          <ProgressBar value={100} />
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2 text-gray-500">
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
            <p className="text-xs font-medium uppercase tracking-wide">Formation</p>
          </div>
          <p className="mb-2 text-2xl font-semibold text-gray-900">{formationPercent} %</p>
          <ProgressBar value={formationPercent} />
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2 text-gray-500">
            <FileText className="h-4 w-4" aria-hidden="true" />
            <p className="text-xs font-medium uppercase tracking-wide">Documents</p>
          </div>
          {training && session ? (
            <>
              <p className="mb-2 text-2xl font-semibold text-gray-900">{documentsPercent} %</p>
              <ProgressBar value={documentsPercent} />
              <p className="mt-2 text-xs text-gray-500">
                {documentsGenerated} / {documentsTotal} générés
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500">En attente de la formation</p>
          )}
        </Card>

        <Card className="opacity-70">
          <div className="mb-3 flex items-center gap-2 text-gray-500">
            <Globe className="h-4 w-4" aria-hidden="true" />
            <p className="text-xs font-medium uppercase tracking-wide">Site internet</p>
          </div>
          <p className="text-sm text-gray-500">Bientôt disponible</p>
        </Card>
      </div>

      {/* Détail organisme / formation / session */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-medium uppercase text-gray-500">Organisme</p>
          <p className="mt-1 font-medium text-gray-900">{org.company_name}</p>
          <Badge variant="success" className="mt-2">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Créé
          </Badge>
        </Card>

        <Card>
          <p className="text-xs font-medium uppercase text-gray-500">Ma formation</p>
          {training ? (
            <>
              <p className="mt-1 font-medium text-gray-900">{training.name}</p>
              <Badge variant="success" className="mt-2">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Créée
              </Badge>
              {themesApplicable && (
                <div className="mt-2">
                  {themesAnswered ? (
                    <Badge variant="success">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Thématiques choisies
                    </Badge>
                  ) : (
                    <Link
                      href="/onboarding/themes"
                      className="inline-flex items-center gap-1 text-sm text-blue-900 underline"
                    >
                      Choisir mes thématiques
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <p className="mt-1 text-sm text-gray-600">Pas encore créée</p>
              <Link
                href="/onboarding/activite"
                className="mt-1 inline-flex items-center gap-1 text-sm text-blue-900 underline"
              >
                Créer ma formation
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </>
          )}
        </Card>

        <Card>
          <p className="text-xs font-medium uppercase text-gray-500">Ma session</p>
          {session ? (
            <>
              <p className="mt-1 font-medium text-gray-900">
                {session.start_date} → {session.end_date}
              </p>
              <Badge variant="success" className="mt-2">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Créée
              </Badge>
              <Link
                href="/parametres/session"
                className="mt-2 inline-flex items-center gap-1 text-sm text-blue-900 underline"
              >
                Modifier
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </>
          ) : training ? (
            <>
              <p className="mt-1 text-sm text-gray-600">Pas encore créée</p>
              <Link
                href="/onboarding/session"
                className="mt-1 inline-flex items-center gap-1 text-sm text-blue-900 underline"
              >
                Créer ma session
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </>
          ) : (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
              <Circle className="h-3.5 w-3.5" aria-hidden="true" />
              En attente de la formation
            </p>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <p className="text-sm text-gray-600">
          {!training
            ? "Étape suivante : choisir votre domaine de formation puis créer votre première formation."
            : themesApplicable && !themesAnswered
            ? "Étape suivante : choisir les thématiques de votre formation pour construire automatiquement votre programme."
            : !session
            ? "Étape suivante : renseigner votre première session (bénéficiaire, dates, formateur)."
            : "Votre programme de formation peut être généré automatiquement à partir de vos réponses."}
        </p>
        {training && (!themesApplicable || themesAnswered) && session && (
          <Link
            href="/onboarding/programme"
            className="mt-2 inline-flex items-center gap-1 text-sm text-blue-900 underline"
          >
            Voir mon programme de formation
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
      </Card>

      {training && session && (
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/documents" className="inline-flex items-center gap-1.5 text-blue-900 underline">
            <FileText className="h-4 w-4" aria-hidden="true" />
            Mes documents
          </Link>
          <Link
            href="/parametres/qualite"
            className="inline-flex items-center gap-1.5 text-blue-900 underline"
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
            Mes informations qualité
          </Link>
          <Link href="/evaluation" className="inline-flex items-center gap-1.5 text-blue-900 underline">
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            Évaluation des acquis
          </Link>
          <Link
            href="/parametres/identite-visuelle"
            className="inline-flex items-center gap-1.5 text-blue-900 underline"
          >
            <Palette className="h-4 w-4" aria-hidden="true" />
            Identité visuelle
          </Link>
          <Link
            href="/parametres/abonnement"
            className="inline-flex items-center gap-1.5 text-blue-900 underline"
          >
            <CreditCard className="h-4 w-4" aria-hidden="true" />
            Mon abonnement
          </Link>
        </div>
      )}

      {isAdmin && (
        <div className="mt-6 border-t border-gray-200 pt-4 text-sm">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-blue-900 underline">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Back-office admin
          </Link>
        </div>
      )}
    </div>
  );
}
