-- Migration 0019 : Dossier d'admission (lot 2 des gaps identifiés en Phase 5,
-- item priorité haute — nouveau type de document, aucun modèle existant à
-- réutiliser). Consolide identité du candidat, financement, positionnement
-- et déclaration d'accessibilité, engagement signé — avant le début de la
-- formation. Renvoie vers le Questionnaire de recueil des besoins déjà
-- existant plutôt que de dupliquer son contenu.

insert into document_templates (id, label, category_scope, applicable_when, linked_indicator_numbers, folder_group, sort_order, is_active) values
('dossier_admission', 'Dossier d''admission', 'all', '{}'::jsonb, ARRAY[4, 26], '03_Avant_formation', 13, true);

insert into document_template_sections (document_template_id, code, title, sort_order, content_type, html_template, source_content_block_type, content_block_scope) values

('dossier_admission', 'header', 'En-tête', 1, 'rich_text', '<p>{{company_name}} — Dossier d''admission</p><p>Formation : <strong>{{training_name}}</strong></p><p>Candidat(e) : <strong>{{student_name}}</strong> — {{student_company}}<br/>Email : {{student_email}}</p><p>Date d''ouverture du dossier : {{generated_date}}</p>', null, 'global'),

('dossier_admission', 'financement', 'Financement de la formation', 2, 'rich_text', '<p>Mode de financement envisagé : {{funding_type_label}} {{funding_details}}</p><p>Ce dossier sera complété, selon le mode de financement retenu, par un devis, une convention ou un contrat de formation professionnelle.</p>', null, 'global'),

('dossier_admission', 'positionnement', 'Positionnement pédagogique', 3, 'rich_text', '<p>Poste occupé / statut actuel : {{student_role}}</p><p>Diplômes et qualifications : ……………………………………………………………………</p><p>Expérience professionnelle en lien avec la formation : ……………………………………………………………………</p><p>Auto-évaluation de son niveau actuel dans le domaine : ☐ Aucune expérience &nbsp; ☐ Débutant &nbsp; ☐ Intermédiaire &nbsp; ☐ Avancé</p><p>Prérequis de la formation vérifiés : ☐ Oui &nbsp; ☐ Non &nbsp; ☐ Non applicable</p>', null, 'global'),

('dossier_admission', 'besoins', 'Analyse des besoins', 4, 'rich_text', '<p>L''analyse détaillée des besoins et attentes du candidat fait l''objet d''un document séparé : le Questionnaire de recueil des besoins, à annexer au présent dossier.</p>', null, 'global'),

('dossier_admission', 'accessibilite', 'Déclaration d''accessibilité', 5, 'rich_text', '<p>Le candidat est-il en situation de handicap ou a-t-il un besoin d''aménagement particulier ? ☐ Oui &nbsp; ☐ Non</p><p>Si oui, nature des aménagements souhaités : ……………………………………………………………………</p><p>Référent handicap de {{company_name}} : {{disability_referent_name}} ({{disability_referent_email}}).</p>', null, 'global'),

('dossier_admission', 'engagement', 'Engagement du candidat', 6, 'rich_text', '<p>Le candidat déclare :</p><ul><li>avoir pris connaissance du programme de formation et du règlement intérieur de {{company_name}} ;</li><li>avoir été informé des modalités d''accès, de déroulement et d''évaluation de la formation ;</li><li>consentir au traitement de ses données personnelles dans le cadre de son inscription, conformément au RGPD ({{dpo_contact_email}}).</li></ul><p>Le candidat est informé que son admission définitive est confirmée à réception du dossier complété et, selon le cas, du devis signé ou de la convention/du contrat de formation signé(e).</p>', null, 'global'),

('dossier_admission', 'signatures', 'Signatures', 7, 'rich_text', '<table style="width:100%; margin-top:8pt;"><tbody><tr><td style="width:50%; vertical-align:top;">Pour {{company_name}}<br/>{{director_name}}<br/><br/>Date et signature :<br/><br/><br/></td><td style="width:50%; vertical-align:top;">Le candidat, {{student_name}}<br/><br/>Date et signature (précédée de la mention manuscrite « Lu et approuvé ») :<br/><br/><br/></td></tr></tbody></table>', null, 'global');
