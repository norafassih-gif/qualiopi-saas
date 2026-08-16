# Logiciel Qualiopi — Partie 1 (dossier de certification)

Voir `claude/conception-moteur-v1.md` (dans le projet Claude "Logiciel qualiopi") pour la conception complète : arborescence, parcours, modèle de données, moteur de règles, etc. Ce README couvre uniquement la mise en route technique.

## Ce qui est en place (Phase 0)

- Next.js 16 (App Router, Turbopack, TypeScript, Tailwind CSS 4)
- Auth Supabase (email/mot de passe) : `/signup`, `/login`, déconnexion
- Règle "un compte = un organisme" (addendum 17 de la conception) : contrainte `unique` en base + vérification applicative dans `lib/actions/organization.ts`
- Onboarding entreprise (`/onboarding/entreprise`) → crée l'organisme
- Dashboard minimal (`/dashboard`) qui redirige vers l'onboarding si l'organisme n'existe pas encore
- Migration SQL complète (`supabase/migrations/0001_init.sql`) : toutes les tables de la conception (organisations, catégories, banque de contenus, questions/règles, formations/sessions, documents, variables), RLS activée partout, policy "un membre ne voit que son organisme"
- Seed du référentiel officiel (`supabase/migrations/0002_seed_referentiel.sql`) : les 7 critères et 32 indicateurs Qualiopi (texte exact du guide de lecture v8), et les 10 catégories de formation

## Ce qui reste à faire ensuite

- Importer les banques de contenu réelles (`banque-contenu-community-management.md`, `banque-procedures-transverses.md`) en base — prévoir un script de parsing dédié plutôt qu'une transcription SQL manuelle (risque d'erreur trop élevé vu le volume)
- `lib/engine/rules-engine.ts`, `variable-resolver.ts`, `document-builder.ts`, `program-builder.ts` (Phase 2-4 de la conception)
- Écrans "Mon domaine de formation" / "Ma formation" / thématiques cochables / questions conditionnelles
- Service de rendu HTML → PDF (Puppeteer self-hosté, cf. point 11 de la conception)
- Back-office admin (Phase 7)

## Mise en route

1. Créer un projet sur [supabase.com](https://supabase.com) (gratuit pour démarrer).
2. Dans l'éditeur SQL de Supabase, exécuter dans l'ordre `supabase/migrations/0001_init.sql` puis `0002_seed_referentiel.sql`.
   (Si vous installez la CLI Supabase, `supabase db push` fait la même chose automatiquement.)
3. Copier `.env.local.example` en `.env.local` et renseigner les clés depuis Project Settings → API sur Supabase.
4. `npm install`
5. `npm run dev` puis ouvrir [http://localhost:3000](http://localhost:3000).

## Note technique importante

Ce projet est en Next.js 16, qui a des changements par rapport aux versions précédentes (ex : `middleware.ts` renommé `proxy.ts`, export nommé `proxy`). Avant toute modification, se référer à `node_modules/next/dist/docs/` plutôt qu'à des connaissances génériques sur Next.js — voir `AGENTS.md`.
