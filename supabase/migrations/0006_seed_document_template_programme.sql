-- Premier modèle de document du moteur : "Programme de formation".
-- Sections modulaires (cf. point 5 de la conception) — chaque section a un
-- content_type qui pilote comment lib/engine/document-builder.ts la
-- résout : variable_block/rich_text (interpolation {{variable}}),
-- content_block_list (liste tirée de la banque de contenu de la
-- formation), table (programme des modules).

insert into document_templates (id, label, category_scope, folder_group, sort_order) values
('programme_formation', 'Programme de formation', 'all', '03_Avant_formation', 10);

insert into document_template_sections
  (document_template_id, code, title, sort_order, content_type, html_template, source_content_block_type)
values
('programme_formation', 'presentation', 'Présentation', 10, 'variable_block',
 '<p>Le présent programme est proposé par <strong>{{company_name}}</strong> ({{siret}}) pour la formation <strong>{{training_name}}</strong>, d''une durée de {{training_duration}} heures, dispensée en modalité {{training_modality}}.</p>',
 null),

('programme_formation', 'public', 'Public visé', 20, 'variable_block',
 '<p>{{training_audience}}</p>',
 null),

('programme_formation', 'prerequis', 'Prérequis', 30, 'variable_block',
 '<p>Aucun prérequis spécifique n''est exigé pour suivre la formation « {{training_name}} », au-delà d''un accès à un ordinateur ou un smartphone connecté à internet. Un entretien de positionnement est réalisé avant l''entrée en formation afin d''adapter le parcours au niveau de chaque bénéficiaire.</p>',
 null),

('programme_formation', 'objectifs', 'Objectifs pédagogiques', 40, 'content_block_list',
 null,
 'pedagogical_objective'),

('programme_formation', 'programme', 'Programme de la formation', 50, 'table',
 null,
 null),

('programme_formation', 'competences', 'Compétences visées', 60, 'content_block_list',
 null,
 'skill'),

('programme_formation', 'methodes', 'Méthodes et moyens pédagogiques', 70, 'content_block_list',
 null,
 'method'),

('programme_formation', 'evaluation', 'Modalités d''évaluation', 80, 'content_block_list',
 null,
 'evaluation_question'),

('programme_formation', 'accessibilite', 'Accessibilité aux personnes en situation de handicap', 90, 'variable_block',
 '<p>La formation est accessible aux personnes en situation de handicap. Pour toute question relative à l''adaptation de cette formation, le référent handicap de {{company_name}} peut être contacté : {{disability_referent}}.</p>',
 null);
