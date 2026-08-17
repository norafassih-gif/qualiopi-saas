-- Migration 0020 : Grilles d'entretien autonomes (indicateurs 21/22),
-- lot 2 des gaps identifiés en Phase 5, item 14. Les vrais documents
-- d'audit de Nora montrent ces grilles comme des documents à part entière,
-- imprimables/remplissables un par un — pas seulement un paragraphe noyé
-- dans une procédure. On ajoute donc 2 nouveaux documents autonomes, sans
-- toucher aux procédures existantes (déjà vérifiées) qui restent la
-- description du processus général.
--
-- Distinction : la grille de sélection d'un candidat intervenant existe déjà
-- (procedure_selection_intervenants, avant recrutement). La nouvelle
-- "grille_entretien_suivi" couvre le SUIVI d'un intervenant déjà en activité
-- (indicateur 21 : "...ET ÉVALUE les compétences des intervenants").

insert into document_templates (id, label, category_scope, applicable_when, linked_indicator_numbers, folder_group, sort_order, is_active) values
('grille_entretien_suivi', 'Grille d''entretien de suivi — intervenant', 'all', '{}'::jsonb, ARRAY[21], '06_Procedures', 40, true),
('grille_entretien_professionnel_annuel', 'Grille d''entretien professionnel annuel — salarié', 'all', '{}'::jsonb, ARRAY[22], '06_Procedures', 41, true);

insert into document_template_sections (document_template_id, code, title, sort_order, content_type, html_template, source_content_block_type, content_block_scope) values

-- ---------- GRILLE D'ENTRETIEN DE SUIVI — INTERVENANT (indicateur 21) ----------
('grille_entretien_suivi', 'header', 'Informations générales', 1, 'rich_text', '<p>{{company_name}} — Grille d''entretien de suivi d''un intervenant</p><p>Nom de l''intervenant : {{trainer_name}}<br/>Date de l''entretien : {{generated_date}}<br/>Mené par : {{quality_referent_name}}</p>', null, 'global'),
('grille_entretien_suivi', 'bilan', 'Bilan des interventions réalisées', 2, 'rich_text', '<p>Formations / sessions animées depuis le dernier entretien : ……………………………………………………………………</p><p>Retours des stagiaires (satisfaction, remarques) : ……………………………………………………………………</p>', null, 'global'),
('grille_entretien_suivi', 'evaluation', 'Évaluation des compétences', 3, 'rich_text', '<table><thead><tr><th>Critère</th><th>Note (1 à 5)</th><th>Commentaires</th></tr></thead><tbody><tr><td>Maîtrise du domaine enseigné</td><td></td><td></td></tr><tr><td>Qualité pédagogique et animation</td><td></td><td></td></tr><tr><td>Respect du programme et des objectifs</td><td></td><td></td></tr><tr><td>Gestion de groupe et adaptation aux publics (dont PSH)</td><td></td><td></td></tr><tr><td>Respect des délais et de l''organisation</td><td></td><td></td></tr></tbody></table>', null, 'global'),
('grille_entretien_suivi', 'axes', 'Axes d''amélioration et besoins', 4, 'rich_text', '<p>Axes de progrès identifiés : ……………………………………………………………………</p><p>Besoins en formation ou outillage pédagogique : ……………………………………………………………………</p>', null, 'global'),
('grille_entretien_suivi', 'decision', 'Décision', 5, 'rich_text', '<p>☐ Poursuite de la collaboration sans réserve &nbsp; ☐ Poursuite avec plan d''accompagnement &nbsp; ☐ Fin de collaboration</p>', null, 'global'),
('grille_entretien_suivi', 'signatures', 'Signatures', 6, 'rich_text', '<table style="width:100%; margin-top:8pt;"><tbody><tr><td style="width:50%; vertical-align:top;">{{company_name}}<br/>{{quality_referent_name}}<br/><br/>Date et signature :<br/><br/><br/></td><td style="width:50%; vertical-align:top;">L''intervenant, {{trainer_name}}<br/><br/>Date et signature :<br/><br/><br/></td></tr></tbody></table>', null, 'global'),

-- ---------- GRILLE D'ENTRETIEN PROFESSIONNEL ANNUEL — SALARIÉ (indicateur 22) ----------
('grille_entretien_professionnel_annuel', 'header', 'Informations générales', 1, 'rich_text', '<p>{{company_name}} — Entretien professionnel annuel</p><p>Nom du salarié : …………………………………… &nbsp; Poste : ……………………………………<br/>Date de l''entretien : {{generated_date}} &nbsp; Mené par : {{manager_name}}</p>', null, 'global'),
('grille_entretien_professionnel_annuel', 'parcours', 'Parcours et missions', 2, 'rich_text', '<p>Principales activités réalisées depuis le dernier entretien : ……………………………………………………………………</p><p>Points forts et difficultés rencontrées : ……………………………………………………………………</p>', null, 'global'),
('grille_entretien_professionnel_annuel', 'competences', 'Compétences actuelles', 3, 'rich_text', '<p>Compétences techniques : ……………………………………………………………………</p><p>Compétences pédagogiques : ……………………………………………………………………</p><p>Compétences transversales (communication, organisation...) : ……………………………………………………………………</p>', null, 'global'),
('grille_entretien_professionnel_annuel', 'besoins', 'Besoins et souhaits de formation', 4, 'rich_text', '<p>Formations liées au poste actuel : ……………………………………………………………………</p><p>Formations liées aux évolutions métiers : ……………………………………………………………………</p><p>Souhaits personnels d''évolution : ……………………………………………………………………</p>', null, 'global'),
('grille_entretien_professionnel_annuel', 'plan_action', 'Plan d''action', 5, 'rich_text', '<p>Formation(s) envisagée(s) : ……………………………………………………………………</p><p>Modalités et période envisagées : ……………………………………………………………………</p><p>Validation : ☐ Oui &nbsp; ☐ Non</p><p>Ce plan d''action alimente le plan de développement des compétences de {{company_name}} pour la période {{plan_period}}.</p>', null, 'global'),
('grille_entretien_professionnel_annuel', 'signatures', 'Signatures', 6, 'rich_text', '<table style="width:100%; margin-top:8pt;"><tbody><tr><td style="width:50%; vertical-align:top;">{{company_name}}<br/>{{manager_name}}<br/><br/>Date et signature :<br/><br/><br/></td><td style="width:50%; vertical-align:top;">Le / la salarié(e)<br/><br/>Date et signature :<br/><br/><br/></td></tr></tbody></table>', null, 'global');
