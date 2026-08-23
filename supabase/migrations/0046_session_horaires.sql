-- Migration 0046 : horaires de session ("9h-12h30 / 13h30-17h") — demande
-- de Nora (23/08/2026, retours de test client ACP) : le programme de
-- formation et les conventions/contrats doivent pouvoir afficher les
-- horaires de la session, pas seulement les dates. Champ texte libre
-- (comme training_location) plutôt qu'un type time strict : une session
-- peut avoir plusieurs créneaux dans la journée (matin/après-midi), un
-- texte libre couvre tous les cas sans complexifier le formulaire.
alter table sessions
  add column if not exists start_time text,
  add column if not exists end_time text;

comment on column sessions.start_time is 'Horaire de début de la session, texte libre (ex. "9h00" ou "9h00 / 13h30") — Phase retours ACP, 23/08/2026.';
comment on column sessions.end_time is 'Horaire de fin de la session, texte libre (ex. "17h00" ou "12h30 / 17h00") — Phase retours ACP, 23/08/2026.';
