-- Migration 0023 : derniers deux items du lot 2 des gaps Phase 5 (item 10 et 13).
--
-- 1) Calendrier détaillé optionnel sur le Contrat de formation (particulier) et
--    la Convention de formation (financement tiers) : jusqu'ici ces deux
--    documents ne portaient que la durée totale (via le programme annexé).
--    Un vrai audit peut demander un déroulé jour par jour pour les formations
--    plus complexes (plusieurs journées non consécutives, présentiel/distanciel
--    mixte, plusieurs intervenants) — ajouté comme section supplémentaire,
--    explicitement marquée optionnelle, sans rien retirer de l'existant.
--
-- 2) Veille accessibilité/PSH (indicateur 26) : 4ème axe de veille, sur le même
--    modèle que légale/métiers/pédagogique (migration 0009), avec ses propres
--    sources et exemples plutôt que de réutiliser le type générique
--    "watch_example" déjà utilisé par la veille légale (pour éviter que les
--    mêmes entrées apparaissent dans deux documents différents).

-- ---------- 1) Calendrier détaillé (optionnel) ----------
-- On décale annexes/signatures d'un cran pour insérer la nouvelle section
-- juste après les articles, avant les annexes.
update document_template_sections set sort_order = 4 where document_template_id = 'convention_formation' and code = 'annexes';
update document_template_sections set sort_order = 5 where document_template_id = 'convention_formation' and code = 'signatures';
update document_template_sections set sort_order = 4 where document_template_id = 'contrat_formation_particulier' and code = 'annexes';
update document_template_sections set sort_order = 5 where document_template_id = 'contrat_formation_particulier' and code = 'signatures';

insert into document_template_sections (document_template_id, code, title, sort_order, content_type, html_template, source_content_block_type, content_block_scope) values
('convention_formation', 'calendrier_detaille', 'Calendrier détaillé (optionnel)', 3, 'rich_text', '<p style="color:#6b7280; font-size:9pt;">Section optionnelle : à compléter si la formation se déroule sur plusieurs journées non consécutives, mêle présentiel et distanciel, ou mobilise plusieurs intervenants. Pour une formation simple, la durée totale ({{training_duration}} heures, du {{training_start_date}} au {{training_end_date}}) et le programme annexé suffisent.</p><table><thead><tr><th>Date</th><th>Créneau horaire</th><th>Contenu / Module</th><th>Formateur</th><th>Modalité</th></tr></thead><tbody><tr><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td></tr></tbody></table>', null, 'global'),
('contrat_formation_particulier', 'calendrier_detaille', 'Calendrier détaillé (optionnel)', 3, 'rich_text', '<p style="color:#6b7280; font-size:9pt;">Section optionnelle : à compléter si la formation se déroule sur plusieurs journées non consécutives, mêle présentiel et distanciel, ou mobilise plusieurs intervenants. Pour une formation simple, la durée totale ({{training_duration}} heures, du {{training_start_date}} au {{training_end_date}}) et le programme annexé suffisent.</p><table><thead><tr><th>Date</th><th>Créneau horaire</th><th>Contenu / Module</th><th>Formateur</th><th>Modalité</th></tr></thead><tbody><tr><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td></tr></tbody></table>', null, 'global');

-- ---------- 2) Veille accessibilité/PSH (indicateur 26) ----------
insert into document_templates (id, label, category_scope, applicable_when, linked_indicator_numbers, folder_group, sort_order, is_active) values
('procedure_veille_accessibilite', 'Procédure de veille accessibilité et handicap (PSH)', 'all', '{}'::jsonb, ARRAY[26], '07_Veille', 65, true);

insert into document_template_sections (document_template_id, code, title, sort_order, content_type, html_template, source_content_block_type, content_block_scope) values
('procedure_veille_accessibilite', 'header', 'En-tête', 1, 'rich_text', '<p>Organisme : {{company_name}}<br/>Objet : Procédure de veille accessibilité et handicap (PSH)<br/>Version : {{procedure_version}}</p>', null, 'global'),
('procedure_veille_accessibilite', 'objectif', 'Objectif', 2, 'rich_text', '<p>Assurer une veille régulière sur les dispositifs, aides, outils et obligations réglementaires relatifs à l''accueil et l''accompagnement des personnes en situation de handicap (PSH), afin d''adapter en continu l''accessibilité des formations de {{company_name}}.</p>', null, 'global'),
('procedure_veille_accessibilite', 'responsables', 'Responsables', 3, 'rich_text', '<ul><li>Référent handicap ({{disability_referent_name}}) : coordination de la veille accessibilité.</li><li>Référente Qualité ({{quality_referent_name}}) : suivi et archivage.</li><li>Formateurs : remontée des besoins d''adaptation observés en session.</li></ul>', null, 'global'),
('procedure_veille_accessibilite', 'sources_principales', 'Sources principales', 4, 'content_block_list', null, 'watch_source_accessibilite', 'global'),
('procedure_veille_accessibilite', 'processus', 'Processus', 5, 'rich_text', '<ol><li>Collecte {{watch_collect_frequency}} par le référent handicap.</li><li>Analyse des impacts sur l''accueil et les supports de formation.</li><li>Diffusion interne via note ou mail.</li><li>Mise à jour du livret d''accueil, de la procédure d''accompagnement PSH et des supports (sous-titrage, contrastes, formats alternatifs...).</li><li>Archivage : tableau de suivi conservé {{archiving_duration}}.</li></ol>', null, 'global'),
('procedure_veille_accessibilite', 'evaluation', 'Évaluation', 6, 'rich_text', '<p>Une vérification est réalisée {{watch_review_frequency}} en réunion qualité, en lien avec la procédure d''accompagnement des personnes en situation de handicap.</p>', null, 'global'),
('procedure_veille_accessibilite', 'registre_veille', 'Registre de veille (structure)', 7, 'rich_text', '<table><thead><tr><th>Date</th><th>Source consultée</th><th>Thème / évolution</th><th>Impact identifié</th><th>Action mise en place</th><th>Responsable</th><th>État</th></tr></thead><tbody><tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr></tbody></table>', null, 'global'),
('procedure_veille_accessibilite', 'exemples_veille', 'Exemples d''entrées (illustratif)', 8, 'content_block_list', null, 'watch_example_accessibilite', 'global');

insert into content_blocks (category_id, type, code, text, is_active) values
(null, 'watch_source_accessibilite', 'WATCH_SOURCE_ACCESSIBILITE_NATIONAL', 'Sources nationales : Agefiph (agefiph.fr — aides et appuis aux organismes de formation), FIPHFP (fiphfp.fr — secteur public), MDPH (annuaire par département), Cap Emploi (accompagnement emploi/formation des PSH), Handicap.fr (portail d''information), Ministère chargé des Personnes handicapées (handicap.gouv.fr).', true),
(null, 'watch_example_accessibilite', 'WATCH_EXAMPLE_ACCESSIBILITE_SOUS_TITRAGE', 'Renforcement des exigences de sous-titrage et transcription pour les contenus e-learning → impact : ajout systématique de sous-titres sur les supports vidéo et mise à disposition d''une version texte alternative.', true),
(null, 'watch_example_accessibilite', 'WATCH_EXAMPLE_ACCESSIBILITE_AIDES_AGEFIPH', 'Revalorisation des aides Agefiph à l''adaptation de poste et de formation pour les stagiaires en situation de handicap → impact : mise à jour de la procédure d''accompagnement PSH et information des bénéficiaires concernés.', true),
(null, 'watch_example_accessibilite', 'WATCH_EXAMPLE_ACCESSIBILITE_LOCAUX', 'Évolution des normes d''accessibilité des établissements recevant du public (ERP) applicables aux salles de formation → impact : vérification de la conformité des locaux utilisés et mise à jour de la fiche moyens techniques.', true);
