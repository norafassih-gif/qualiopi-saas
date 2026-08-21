-- Paiement obligatoire avant de renseigner l'entreprise (décision de Nora,
-- 21/08/2026) : jusqu'ici, un nouveau compte pouvait utiliser tout le
-- logiciel gratuitement indéfiniment, sans jamais être invité à payer.
--
-- Nouveau parcours : à la création du compte, le client est envoyé sur un
-- écran de choix de formule AVANT de renseigner son entreprise. Au moment du
-- paiement (lib/actions/billing.ts, startCheckout), un organisme
-- "placeholder" (company_name provisoire) est créé pour rattacher le
-- paiement Stripe. Ce booléen distingue ce placeholder du vrai formulaire
-- "Mon entreprise" rempli juste après le paiement.
alter table organizations
  add column onboarding_company_completed boolean not null default false;

comment on column organizations.onboarding_company_completed is
  'Passe à true une fois que le client a rempli le vrai formulaire "Mon entreprise" (étape qui suit désormais le paiement). Avant cela, la ligne peut être un placeholder créé automatiquement par startCheckout au moment du paiement (company_name = "Organisme à compléter").';

-- Tous les organismes déjà existants avant ce changement ont été créés via
-- l'ancien parcours ("entreprise d'abord") : ils ont donc forcément déjà
-- rempli leurs vraies informations. On les marque comme complétés pour ne
-- pas les renvoyer par erreur vers le formulaire "Mon entreprise".
update organizations set onboarding_company_completed = true;
