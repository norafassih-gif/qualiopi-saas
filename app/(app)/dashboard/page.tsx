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
  LogOut,
} from "lucide-react";
import { redirect } from "next/navigation";
import { getMyOrganization } from "@/lib/actions/organization";
import { getMyFirstTraining } from "@/lib/actions/training";
import { getMyFirstSession } from "@/lib/actions/session";
import { listCategoryQuestions, getMyAnswers } from "@/lib/actions/questions";
import { listDocumentTemplatesWithStatus } from "@/lib/actions/documents";
import { signOut } from "@/lib/actions/auth";
import { isPlatformAdmin } from "@/lib/actions/admin";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";

export default async function DashboardPage() {
  const org = await getMyOrganization();

  // Pas encore d'organisme -> onboarding (parcours prioritaire, point 2 de la conception).
  if (!org) {
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bonjour</h1>
          <p className="text-gray-600">{org.company_name}</p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Se déconnecter
          </button>
        </form>
      </div>

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
              <p className="mt-2 text-xs text-gray-400">
                {documentsGenerated} / {documentsTotal} générés
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-400">En attente de la formation</p>
          )}
        </Card>

        <Card className="opacity-70">
          <div className="mb-3 flex items-center gap-2 text-gray-500">
            <Globe className="h-4 w-4" aria-hidden="true" />
            <p className="text-xs font-medium uppercase tracking-wide">Site internet</p>
          </div>
          <p className="text-sm text-gray-400">Bientôt disponible</p>
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
            <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-400">
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
