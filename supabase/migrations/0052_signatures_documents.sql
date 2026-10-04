-- Signatures manquantes (retour de Nora sur le dossier CFS, 04/10/2026).
--  * Devis : le client signe aussi, avec la mention « Bon pour accord »
--    (signature reprise de l'émargement si besoin, cf. document-builder).
--  * Moyens pédagogiques, moyens techniques, organisation des actions :
--    signature et cachet du dirigeant sous « Fait à ..., le ... ».
--  * Programme de formation : signature et cachet du dirigeant en fin de
--    document.

update public.document_template_sections
set html_template = '<table style="width:100%; margin-top:8pt;"><tbody><tr><td style="width:50%; vertical-align:top;">Pour {{company_name}}<br/>{{director_name}}<br/><br/>Date et signature :<br/>{{org_signature_image}}{{org_stamp_image}}<br/><br/></td><td style="width:50%; vertical-align:top;">Pour le client<br/>{{student_name}} — {{student_company}}<br/><br/>{{student_accord_block}}</td></tr></tbody></table>'
where document_template_id = 'devis' and code = 'acceptation';

update public.document_template_sections
set html_template = html_template || '<p>{{org_signature_image}}{{org_stamp_image}}</p>'
where (document_template_id, code) in (
  ('nda_moyens_pedagogiques', 'handicap'),
  ('nda_moyens_techniques', 'handicap'),
  ('nda_organisation_actions', 'acces')
)
and html_template not like '%org_signature_image%';

insert into public.document_template_sections (document_template_id, code, title, sort_order, content_type, html_template)
select 'programme_formation', 'signature', '', 99, 'rich_text',
  '<p>Fait à {{organization_city}}, le {{generated_date}}</p><p>{{director_name}}, pour {{company_name}}</p><p>{{org_signature_image}}{{org_stamp_image}}</p>'
where not exists (
  select 1 from public.document_template_sections
  where document_template_id = 'programme_formation' and code = 'signature'
);
