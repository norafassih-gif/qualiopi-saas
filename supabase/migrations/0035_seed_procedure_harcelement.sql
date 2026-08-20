-- Migration 0035 : Procédure de prévention et de traitement des violences
-- sexistes et sexuelles et du harcèlement.
--
-- Contexte (cf. claude/roadmap-produit-et-tarifs.md, section 8, 20/08/2026) :
-- le décret n° 2026-728 du 1er août 2026 (nouveau référentiel Qualiopi,
-- entrée en vigueur le 1er novembre 2026) renforce les obligations des
-- organismes de formation sur ce sujet. En auditant le code le même jour,
-- on a constaté qu'aujourd'hui une seule clause de règlement intérieur
-- (RI_CL_06_HARCELEMENT, migration 0014) couvre ce thème — pas de
-- procédure dédiée avec personne ressource identifiée et processus de
-- signalement/traitement, ce qui est la norme attendue.
--
-- ⚠️ Ce contenu s'appuie sur les obligations légales déjà stables et
-- établies (Code du travail, harcèlement moral/sexuel et agissements
-- sexistes — articles L1152-1, L1153-1, L1142-2-1 ; désignation d'un
-- référent prévue par la loi du 5 septembre 2018 pour les entreprises
-- d'au moins 250 salariés, ici transposée en bonne pratique volontaire
-- pour un organisme de formation). Il ne s'appuie PAS sur le contenu
-- précis du nouveau référentiel à 33 indicateurs, dont le guide de
-- lecture officiel n'est pas encore publié au 20/08/2026 — c'est
-- pourquoi `linked_indicator_numbers` reste vide ci-dessous plutôt que
-- de risquer un mauvais numéro d'indicateur. À compléter dès que le
-- guide de lecture officiel du décret 2026-728 est disponible.
-- Comme pour la convention/le contrat/le règlement intérieur (migrations
-- 0013-0014), le contenu juridique est à faire valider par Nora avant
-- usage réel par ses clients.

insert into content_blocks (category_id, type, code, text, is_active) values
(null, 'legal_clause_harcelement', 'HARC_CL_01_DEFINITION', 'Le harcèlement moral se caractérise par des agissements répétés ayant pour objet ou pour effet une dégradation des conditions de vie ou de travail susceptible de porter atteinte aux droits et à la dignité, d''altérer la santé physique ou mentale, ou de compromettre l''avenir professionnel (article L1152-1 du Code du travail). Le harcèlement sexuel se caractérise par des propos ou comportements à connotation sexuelle ou sexiste répétés, ou par toute forme de pression grave dans le but réel ou apparent d''obtenir un acte de nature sexuelle (article L1153-1 du Code du travail). Les agissements sexistes — tout agissement lié au sexe d''une personne, ayant pour objet ou pour effet de porter atteinte à sa dignité ou de créer un environnement intimidant, hostile, dégradant, humiliant ou offensant — sont également prohibés (article L1142-2-1 du Code du travail).', true),
(null, 'legal_clause_harcelement', 'HARC_CL_02_ENGAGEMENT', '{{company_name}} s''engage à garantir à chaque stagiaire, formateur et intervenant un environnement de formation exempt de toute forme de violence sexiste ou sexuelle et de harcèlement, quel que soit le lieu (locaux de {{company_name}}, locaux mis à disposition par un tiers, ou formation à distance) et le support (échanges en présentiel, messagerie, visioconférence, réseaux sociaux professionnels liés à la formation).', true),
(null, 'legal_clause_harcelement', 'HARC_CL_03_PERSONNE_RESSOURCE', 'Toute personne s''estimant victime ou témoin de faits de harcèlement ou de violences sexistes et sexuelles peut, à tout moment et en toute confidentialité, en informer {{quality_referent_name}} (référent qualité) ou {{director_name}} (direction), qui constituent les personnes ressources désignées par {{company_name}} pour recueillir ce type de signalement.', true),
(null, 'legal_clause_harcelement', 'HARC_CL_04_SIGNALEMENT', 'Le signalement peut être effectué par tout moyen : oralement, par écrit, ou par email à {{complaints_email}}. Il n''est soumis à aucun formalisme particulier. La personne ressource accuse réception du signalement dans les meilleurs délais et informe son auteur des suites qui y seront données, dans le respect de la confidentialité de toutes les parties concernées.', true),
(null, 'legal_clause_harcelement', 'HARC_CL_05_TRAITEMENT', 'Dès réception d''un signalement, {{company_name}} met en œuvre les mesures suivantes : entretien avec la personne à l''origine du signalement, recueil des éléments factuels auprès des personnes concernées dans le respect du contradictoire, mesures conservatoires si nécessaire pour protéger la personne s''estimant victime (aménagement d''emploi du temps, séparation des parties), puis décision motivée. Selon la gravité et la nature des faits établis, {{company_name}} peut prendre des mesures disciplinaires à l''encontre de leur auteur, dans les conditions prévues par le règlement intérieur, et informer les autorités compétentes lorsque les faits sont susceptibles de constituer une infraction pénale.', true),
(null, 'legal_clause_harcelement', 'HARC_CL_06_PROTECTION', 'Aucune personne ayant signalé de bonne foi des faits de harcèlement ou de violences sexistes et sexuelles, ni aucun témoin ayant relaté de tels faits, ne peut faire l''objet d''une mesure discriminatoire ou d''une sanction de ce fait, conformément à l''article L1152-2 du Code du travail.', true),
(null, 'legal_clause_harcelement', 'HARC_CL_07_SENSIBILISATION', 'La présente procédure est communiquée à chaque stagiaire dans le livret d''accueil et affichée dans les locaux de formation lorsque celle-ci se déroule en présentiel. Elle fait l''objet d''un rappel en début de session par le formateur ou la formatrice.', true);

insert into document_templates (id, label, category_scope, applicable_when, linked_indicator_numbers, folder_group, sort_order, is_active) values
('procedure_harcelement', 'Procédure de prévention et de traitement des violences sexistes et sexuelles et du harcèlement', 'all', '{}'::jsonb, ARRAY[]::int[], '06_Procedures', 160, true);

insert into document_template_sections (document_template_id, code, title, sort_order, content_type, html_template, source_content_block_type, content_block_scope) values
('procedure_harcelement', 'header', 'En-tête', 1, 'rich_text', '<p>Organisme : {{company_name}}<br/>Objet : Procédure de prévention et de traitement des violences sexistes et sexuelles et du harcèlement<br/>Version : {{procedure_version}}</p>', null, 'global'),
('procedure_harcelement', 'objectif', 'Objectif', 2, 'rich_text', '<p>Garantir à chaque stagiaire, formateur et intervenant un environnement de formation exempt de toute forme de harcèlement ou de violence sexiste et sexuelle, et définir un processus clair de signalement, de traitement et de protection en cas de faits avérés ou suspectés.</p>', null, 'global'),
('procedure_harcelement', 'champ_application', 'Champ d''application', 3, 'rich_text', '<p>Tous les stagiaires, formateurs internes, vacataires et prestataires externes intervenant dans les formations de {{company_name}}, quel que soit le lieu (présentiel, distanciel) ou le support des échanges.</p>', null, 'global'),
('procedure_harcelement', 'clauses', 'Dispositions', 4, 'content_block_list', null, 'legal_clause_harcelement', 'global'),
('procedure_harcelement', 'archivage', 'Archivage', 5, 'rich_text', '<p>Les signalements reçus et leur traitement sont conservés {{archiving_duration}}, dans des conditions garantissant la confidentialité des personnes concernées.</p>', null, 'global'),
('procedure_harcelement', 'entree_vigueur', 'Entrée en vigueur', 6, 'rich_text', '<p>Fait à {{organization_city}}, le {{generated_date}}.<br/>{{director_name}}, pour {{company_name}}.</p>', null, 'global');
