-- Formation « sur mesure » : pour les formations très spécifiques qui
-- n'entrent dans aucun des 10 domaines (ex. prévention du risque électrique
-- NF C 18-510). Le client saisit lui-même ses objectifs, modules,
-- prérequis, méthodes et évaluations ; les documents se construisent avec
-- ce texte, sans IA.

insert into public.training_categories (id, label, description, is_active, sort_order)
values (
  'sur_mesure',
  'Autre domaine (programme sur mesure)',
  'Votre formation n''entre dans aucun domaine de la liste : vous saisissez vous-même vos objectifs et vos modules.',
  true,
  99
)
on conflict (id) do nothing;

alter table public.trainings
  add column if not exists custom_program jsonb,
  add column if not exists nsf_specialty text;

-- Prérequis du programme : variable, pour qu'une formation sur mesure
-- puisse afficher ses propres prérequis (texte inchangé pour les autres).
update public.document_template_sections
set html_template = '<p>{{training_prerequisites}}</p>'
where document_template_id = 'programme_formation' and code = 'prerequis';
