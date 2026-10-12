-- 0056 : nom et signature du financeur / de l'entreprise sur les questionnaires de satisfaction
alter table public.stakeholder_satisfaction_responses add column if not exists signature_data_url text;
alter table public.document_template_sections drop constraint if exists document_template_sections_content_type_check;
alter table public.document_template_sections add constraint document_template_sections_content_type_check check (content_type = any (array['rich_text','variable_block','table','content_block_list','checklist','signature_block','attendance_grid','data_table','org_chart','qcm_answers','satisfaction_results','trainer_satisfaction_results','stakeholder_satisfaction_results','stakeholder_signature']));
update public.document_template_sections set content_type='stakeholder_signature', html_template=null, data_source='financeur' where code='signature' and document_template_id='questionnaire_satisfaction_financeur';
update public.document_template_sections set content_type='stakeholder_signature', html_template=null, data_source='entreprise' where code='signature' and document_template_id='questionnaire_satisfaction_entreprise';
