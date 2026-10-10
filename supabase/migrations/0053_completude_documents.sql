-- 0053 : dossier d'admission complet, dirigeant = formateur, signature formateur
alter table public.beneficiaries add column if not exists diplomas_qualifications text;
alter table public.beneficiaries add column if not exists related_experience text;
alter table public.beneficiaries add column if not exists accommodation_details text;
alter table public.sessions add column if not exists trainer_is_manager boolean not null default false;

update public.document_template_sections set html_template =
 '<p>Poste occupé / statut actuel : {{student_role}}</p><p>Diplômes et qualifications : {{admission_diplomas}}</p><p>Expérience professionnelle en lien avec la formation : {{admission_related_experience}}</p><p>Auto-évaluation de son niveau actuel dans le domaine : {{needs_experience_level_checkboxes}}</p><p>Prérequis de la formation vérifiés : {{prerequisites_verified_checkboxes}}</p>'
 where document_template_id='dossier_admission' and code='positionnement';

update public.document_template_sections set html_template =
 '<p>Le candidat est-il en situation de handicap ou a-t-il un besoin d''aménagement particulier ? {{needs_disability_checkboxes}}</p><p>Si oui, nature des aménagements souhaités : {{admission_accommodation_details}}</p><p>Référent handicap de {{company_name}} : {{disability_referent_name}} ({{disability_referent_email}}).</p>'
 where document_template_id='dossier_admission' and code='accessibilite';

update public.document_template_sections set html_template =
 '<p>Fait à {{organization_city}}, le {{generated_date}}</p><p>Signature du formateur : {{trainer_name}}</p><p>{{trainer_signature_block}}</p>'
 where document_template_id='questionnaire_satisfaction_formateur' and code='signature';

update public.document_template_sections set html_template = replace(html_template, 'Date et signature :<br/><br/><br/></td></tr>', 'Date et signature :<br/>{{trainer_signature_block}}</td></tr>')
 where document_template_id='grille_entretien_suivi' and code='signatures' and html_template not like '%trainer_signature_block%';
