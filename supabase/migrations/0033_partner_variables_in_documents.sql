-- Migration 0033 : remplace les blancs à remplir à la main
-- (…………………………) du Contrat de sous-traitance et de la Convention de
-- partenariat par les nouvelles variables {{partner_*}} (cf. migration 0032,
-- table partners). Mêmes documents, mêmes articles/sections — seul le
-- html_template change, aucune structure de document modifiée.

-- ---------- CONTRAT DE SOUS-TRAITANCE ----------

update document_template_sections set html_template = replace(html_template,
  '2) …………………………………………………… (nom, prénom du formateur), né(e) le ……………, domicilié(e) à ……………………………………………………, immatriculé(e) sous le n° SIRET ……………………, ci-après désigné(e) « le Formateur ».',
  '2) {{partner_full_name}}, domicilié(e) à {{partner_address}}, immatriculé(e) sous le n° SIRET {{partner_siret}}, ci-après désigné(e) « le Formateur ».'
) where document_template_id = 'contrat_sous_traitance' and code = 'header';

update document_template_sections set html_template = replace(html_template,
  'Public / groupe concerné : ……………………………………………………',
  'Public / groupe concerné : {{partner_mission_details}}'
) where document_template_id = 'contrat_sous_traitance' and code = 'nature_objet';

update document_template_sections set html_template = replace(html_template,
  'Le contrat est conclu pour la période allant du …………… au ……………. Nombre d''heures prévisionnel : ……… heures.',
  'Le contrat est conclu pour la période allant du {{partner_mission_start_date}} au {{partner_mission_end_date}}. Nombre d''heures prévisionnel : {{training_duration}} heures.'
) where document_template_id = 'contrat_sous_traitance' and code = 'duree_lieu';

update document_template_sections set html_template = replace(html_template,
  'rémunère le Formateur à hauteur de : ……… € HT/heure.',
  'rémunère le Formateur à hauteur de : {{partner_hourly_rate_formatted}}.'
) where document_template_id = 'contrat_sous_traitance' and code = 'remuneration';

update document_template_sections set html_template = replace(html_template,
  'Le Formateur<br/><br/>Signature :<br/><br/><br/>',
  'Le Formateur<br/>{{partner_full_name}}<br/><br/>Signature :<br/><br/><br/>'
) where document_template_id = 'contrat_sous_traitance' and code = 'signatures';

-- ---------- CONVENTION DE PARTENARIAT ----------

update document_template_sections set html_template = replace(html_template,
  'Et …………………………………………………… (entreprise partenaire), représentée par …………………………………………………… , …………………………… (fonction).',
  'Et {{partner_full_name}} (entreprise partenaire), immatriculée sous le n° SIRET {{partner_siret}}, représentée par {{partner_legal_representative_name}}, {{partner_legal_representative_role}}.'
) where document_template_id = 'convention_partenariat' and code = 'header';

update document_template_sections set html_template = replace(html_template,
  'Période : du …………… au ……………. Lieu(x) d''exécution : adresse(s) du site d''accueil.',
  'Période : du {{partner_mission_start_date}} au {{partner_mission_end_date}}. Lieu(x) d''exécution : {{partner_address}}.'
) where document_template_id = 'convention_partenariat' and code = 'cadre_objectifs';

update document_template_sections set html_template = replace(html_template,
  'Désigner un tuteur référent (nom, fonction, email, téléphone), assurer l''accompagnement et la sécurité ; présenter les règles internes et consignes HSE le premier jour.',
  'Désigner un tuteur référent — {{partner_tutor_name}}, {{partner_tutor_role}} ({{partner_tutor_email}} / {{partner_tutor_phone}}) — assurer l''accompagnement et la sécurité ; présenter les règles internes et consignes HSE le premier jour.'
) where document_template_id = 'convention_partenariat' and code = 'engagements_entreprise';

update document_template_sections set html_template = replace(html_template,
  'Pour l''entreprise partenaire<br/><br/>Signature :<br/><br/><br/>',
  'Pour l''entreprise partenaire<br/>{{partner_legal_representative_name}}<br/><br/>Signature :<br/><br/><br/>'
) where document_template_id = 'convention_partenariat' and code = 'signatures';
