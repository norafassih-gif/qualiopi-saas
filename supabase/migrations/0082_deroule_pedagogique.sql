-- Migration 0082 : Déroulé pédagogique (indicateur 6).
--
-- Demande de Nora (13/10/2026) : l'auditeur réclame le déroulé pédagogique
-- détaillé (séquences, durées, méthodes) ; modèle : "Déroulé Novesia".
-- Le tableau "deroule_planning" est calculé par le moteur
-- (lib/engine/deroule-pedagogique.ts) à partir de la session, des modules et
-- des exercices retenus : aucune IA. Les autres sections réutilisent les
-- variables et banques existantes.

insert into document_templates (id, label, category_scope, applicable_when, linked_indicator_numbers, folder_group, sort_order, is_active, tip) values
('deroule_pedagogique', 'Déroulé pédagogique', 'all', '{}'::jsonb, ARRAY[6], '03_Avant_formation', 11, true,
 'À dater AVANT le début de la formation. Les horaires de chaque séquence sont calculés à partir des dates, des horaires et de la durée de la session : vérifiez-les avant de présenter le document à l''auditeur.');

insert into document_template_sections (document_template_id, code, title, sort_order, content_type, html_template, source_content_block_type, content_block_scope) values
('deroule_pedagogique', 'presentation', 'Présentation', 10, 'variable_block',
 '<table><tbody><tr><th>Formation</th><td>{{training_name}}</td></tr><tr><th>Organisme</th><td>{{company_name}}</td></tr><tr><th>Durée</th><td>{{training_duration}} heures</td></tr><tr><th>Dates</th><td>{{training_dates_label}}</td></tr><tr><th>Horaires</th><td>{{training_hours}}</td></tr><tr><th>Modalité</th><td>{{training_modality}}</td></tr><tr><th>Formateur</th><td>{{trainer_name}}</td></tr><tr><th>Public visé</th><td>{{training_audience}}</td></tr></tbody></table>',
 null, 'training'),
('deroule_pedagogique', 'objectifs', 'Objectifs pédagogiques', 20, 'content_block_list', null, 'pedagogical_objective', 'training'),
('deroule_pedagogique', 'planning', 'Déroulé détaillé de la formation', 30, 'variable_block', '{{deroule_planning}}', null, 'training'),
('deroule_pedagogique', 'methodes', 'Méthodes et moyens pédagogiques', 40, 'content_block_list', null, 'method', 'training'),
('deroule_pedagogique', 'evaluation', 'Suivi et évaluation des acquis', 50, 'rich_text',
 '<p>Les acquis sont évalués à trois moments : un positionnement à l''entrée en formation, des évaluations formatives en cours de formation (exercices et mises en pratique) et une évaluation sommative en fin de formation. La satisfaction des stagiaires est recueillie à l''issue de la formation.</p>',
 null, 'training'),
('deroule_pedagogique', 'accessibilite', 'Accessibilité aux personnes en situation de handicap', 60, 'variable_block',
 '<p>La formation est accessible aux personnes en situation de handicap. Pour toute question relative à l''adaptation de cette formation, le référent handicap de {{company_name}} peut être contacté : {{disability_referent}}.</p>',
 null, 'training'),
('deroule_pedagogique', 'signature', '', 99, 'rich_text',
 '<p>Fait à {{organization_city}}, le {{generated_date}}</p><p>{{director_name}}, pour {{company_name}}</p><p>{{org_signature_image}}{{org_stamp_image}}</p>',
 null, 'training');
