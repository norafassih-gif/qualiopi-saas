-- Distingue les 3 moments d'évaluation attendus par le référentiel Qualiopi,
-- confirmé par relecture du guide de lecture officiel (v8 et v9, identiques
-- sur ce point) et du livre blanc Digiforma :
--   - indicateur 8 (critère 2) : "Le prestataire détermine les procédures de
--     positionnement et d'évaluation des acquis À L'ENTRÉE de la
--     prestation."
--   - indicateur 11 (critère 3) : "Le prestataire évalue l'atteinte par les
--     publics bénéficiaires des objectifs de la prestation." Les preuves
--     attendues listées par le guide sont des "outils d'évaluation des
--     acquis EN COURS ET EN FIN de prestation (à chaud et à froid)" — donc
--     bien deux moments distincts, pas un seul. Le guide précise aussi que
--     l'absence de preuve d'évaluation ne peut jamais être une simple
--     non-conformité mineure sur cet indicateur (toujours majeure).
--
-- Jusqu'ici (Phase 8/9), le moteur de QCM ne produisait qu'une seule
-- tentative générique, implicitement traitée comme une évaluation finale
-- (le document "resultat_evaluation" était lié aux indicateurs 10/11 sans
-- distinction de moment). Cette migration :
--   1. Ajoute une colonne `phase` sur evaluation_attempts, avec pour valeur
--      par défaut 'finale' afin de ne pas casser les tentatives déjà
--      enregistrées avant cette migration.
--   2. Ajoute deux nouveaux modèles de document réutilisant exactement la
--      structure de "resultat_evaluation" (4 sections identiques : header /
--      resultat / modalites / signature), avec un wording et un indicateur
--      Qualiopi adaptés à chaque moment :
--        - "resultat_positionnement" (indicateur 8, dossier
--          03_Avant_formation)
--        - "resultat_evaluation_cours" (indicateur 11, dossier
--          04_Pendant_formation)
--   3. Renomme "resultat_evaluation" existant pour clarifier qu'il
--      correspond désormais explicitement au moment "finale" (dossier
--      05_Apres_formation, inchangé).
--
-- La banque de questions QCM (evaluation_questions/evaluation_answer_options,
-- migrations 0024/0025/0026) reste partagée entre les 3 moments : une même
-- banque de questions peut servir de test de positionnement, de point
-- d'étape en cours de formation, et d'évaluation finale — seul le moment
-- choisi par l'utilisateur sur l'écran /evaluation change, et donc le
-- document généré. Aucun appel IA, comme le reste du moteur.

alter table evaluation_attempts
  add column phase text not null default 'finale'
  check (phase in ('positionnement', 'en_cours', 'finale'));

-- ---------- Résultat du positionnement à l'entrée en formation (indicateur 8) ----------

insert into document_templates (id, label, category_scope, linked_indicator_numbers, folder_group, sort_order) values
('resultat_positionnement', 'Résultat du positionnement à l''entrée en formation', 'all', array[8], '03_Avant_formation', 30);

insert into document_template_sections (document_template_id, code, title, sort_order, content_type, html_template, source_content_block_type, content_block_scope) values
('resultat_positionnement', 'header', 'En-tête', 1, 'rich_text', '<p>Organisme : {{company_name}}<br/>Formation : {{training_name}}<br/>Bénéficiaire : {{student_name}}<br/>Date du positionnement : {{evaluation_completed_date}}</p>', null, 'global'),
('resultat_positionnement', 'resultat', 'Résultat du positionnement', 2, 'rich_text', '<table><tbody><tr><td>Score obtenu</td><td>{{evaluation_score_raw}} / {{evaluation_score_max}}</td></tr><tr><td>Note sur 20</td><td>{{evaluation_score_on20}} / 20</td></tr><tr><td>Pourcentage</td><td>{{evaluation_score_percent}} %</td></tr><tr><td>Niveau constaté à l''entrée</td><td>{{evaluation_passed_label}}</td></tr></tbody></table>', null, 'global'),
('resultat_positionnement', 'modalites', 'Modalités', 3, 'rich_text', '<p>Ce positionnement est réalisé à l''entrée en formation, avant le démarrage des séances, afin d''identifier le niveau initial du bénéficiaire et d''adapter si nécessaire le déroulé pédagogique (indicateur Qualiopi n°8 — procédures de positionnement et d''évaluation des acquis à l''entrée de la prestation). Il est réalisé sous forme de questionnaire à choix multiples (QCM), auto-corrigé, résultat communiqué immédiatement au bénéficiaire.</p>', null, 'global'),
('resultat_positionnement', 'signature', 'Validation', 4, 'signature_block', null, null, 'global');

-- ---------- Résultat de l'évaluation en cours de formation (indicateur 11) ----------

insert into document_templates (id, label, category_scope, linked_indicator_numbers, folder_group, sort_order) values
('resultat_evaluation_cours', 'Résultat de l''évaluation en cours de formation', 'all', array[11], '04_Pendant_formation', 20);

insert into document_template_sections (document_template_id, code, title, sort_order, content_type, html_template, source_content_block_type, content_block_scope) values
('resultat_evaluation_cours', 'header', 'En-tête', 1, 'rich_text', '<p>Organisme : {{company_name}}<br/>Formation : {{training_name}}<br/>Bénéficiaire : {{student_name}}<br/>Date de l''évaluation : {{evaluation_completed_date}}</p>', null, 'global'),
('resultat_evaluation_cours', 'resultat', 'Résultat', 2, 'rich_text', '<table><tbody><tr><td>Score obtenu</td><td>{{evaluation_score_raw}} / {{evaluation_score_max}}</td></tr><tr><td>Note sur 20</td><td>{{evaluation_score_on20}} / 20</td></tr><tr><td>Pourcentage de réussite</td><td>{{evaluation_score_percent}} %</td></tr><tr><td>Seuil de réussite indicatif</td><td>70 %</td></tr><tr><td>Résultat</td><td>{{evaluation_passed_label}}</td></tr></tbody></table>', null, 'global'),
('resultat_evaluation_cours', 'modalites', 'Modalités', 3, 'rich_text', '<p>Cette évaluation est réalisée en cours de formation afin de mesurer la progression du bénéficiaire sur les objectifs pédagogiques et d''ajuster si nécessaire l''accompagnement (indicateur Qualiopi n°11 — le prestataire évalue l''atteinte par les bénéficiaires des objectifs de la prestation, en cours et en fin de prestation). Elle est réalisée sous forme de questionnaire à choix multiples (QCM), auto-corrigé, résultat communiqué immédiatement au bénéficiaire.</p>', null, 'global'),
('resultat_evaluation_cours', 'signature', 'Validation', 4, 'signature_block', null, null, 'global');

-- ---------- Clarification du document existant : c'est désormais explicitement le moment "finale" ----------

update document_templates
set label = 'Résultat de l''évaluation finale des acquis (QCM)'
where id = 'resultat_evaluation';

update document_template_sections
set html_template = '<p>Organisme : {{company_name}}<br/>Formation : {{training_name}}<br/>Bénéficiaire : {{student_name}}<br/>Date de l''évaluation finale : {{evaluation_completed_date}}</p>'
where document_template_id = 'resultat_evaluation' and code = 'header';

update document_template_sections
set html_template = '<p>Cette évaluation est réalisée en fin de formation afin d''évaluer l''atteinte par le bénéficiaire des objectifs de la prestation (indicateur Qualiopi n°11). Elle est réalisée sous forme de questionnaire à choix multiples (QCM), auto-corrigé, résultat communiqué immédiatement au bénéficiaire.</p>'
where document_template_id = 'resultat_evaluation' and code = 'modalites';
