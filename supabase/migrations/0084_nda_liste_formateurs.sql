-- Pièce NDA « Liste des formateurs », demandée à l'étape « Formateurs » de
-- Mon Activité Formation. Générée depuis les données déjà saisies (dirigeant,
-- formateur de la session, formateur externe). Variables : nda_trainers_rows,
-- nda_trainers_count (lib/engine/nda-documents.ts).

insert into public.document_templates
  (id, label, category_scope, applicable_when, linked_indicator_numbers, folder_group, sort_order, is_active, tip)
values
  ('nda_liste_formateurs', 'Liste des formateurs', 'all', '{}'::jsonb, '{}', '00_Declaration_activite', 6, true,
   'À déposer à l''étape « Formateurs » de Mon Activité Formation, avec le CV et les diplômes de chaque formateur.')
on conflict (id) do nothing;

insert into public.document_template_sections
  (document_template_id, code, title, content_type, sort_order, html_template, content_block_scope, source_content_block_type)
values
('nda_liste_formateurs', 'intro', 'Objet', 'rich_text', 1,
 '<p>Le présent document recense les formateurs intervenant pour le compte de {{company_name}} (SIRET {{siret}}), organisme exerçant dans le domaine suivant : {{nda_specialty}}.</p>', 'global', null),
('nda_liste_formateurs', 'liste', '1. Formateurs intervenant dans l''organisme', 'rich_text', 2,
 '<table class="register"><thead><tr><th>Nom et prénom</th><th>Fonction</th><th>Domaine d''intervention</th><th>Lien avec l''organisme</th><th>Qualifications</th></tr></thead><tbody>{{nda_trainers_rows}}</tbody></table><p>Nombre de formateurs : {{nda_trainers_count}}.</p>', 'global', null),
('nda_liste_formateurs', 'formation', '2. Action de formation concernée', 'rich_text', 3,
 '<p>{{training_name}}, {{training_duration}} heures, modalité : {{training_modality}}.</p>', 'global', null),
('nda_liste_formateurs', 'pieces', '3. Pièces jointes', 'rich_text', 4,
 '<ul>{{nda_contract_pieces}}</ul>', 'global', null),
('nda_liste_formateurs', 'attestation', '4. Attestation', 'rich_text', 5,
 '<p>Je soussigné(e) {{manager_name}}, {{manager_title}} de {{company_name}}, certifie que la liste ci-dessus est exacte et sera actualisée à chaque entrée ou sortie d''un formateur.</p><p>Fait à {{organization_city}}, le {{generated_date}}<br/>{{manager_name}}, pour {{company_name}}</p><p>{{org_signature_image}}{{org_stamp_image}}</p>', 'global', null);
