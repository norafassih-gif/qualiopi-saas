-- Phase 13 (suite Phase 12) : le cachet et la signature électronique de
-- l'organisme (org_stamp_image / org_signature_image, cf. migration
-- 0029_cachet_signature.sql) ne s'affichaient jusqu'ici automatiquement que
-- sur les documents utilisant le type de section générique "signature_block"
-- (ex. grille de sélection des sous-traitants). Les 4 documents à signatures
-- à deux colonnes rédigés en rich_text littéral (Contrat de formation
-- particulier, Convention de formation, Contrat de sous-traitance,
-- Convention de partenariat) n'avaient pas été retouchés — cette migration
-- insère les deux variables dans la colonne "organisme" de chacun (jamais
-- côté stagiaire/cocontractant/formateur/partenaire, qui reste une ligne
-- vide à signer à la main).

update document_template_sections
set html_template = replace(
  html_template,
  'Date et signature :<br/><br/><br/></td><td style="width:50%; vertical-align:top;">Le stagiaire',
  'Date et signature :<br/>{{org_signature_image}}{{org_stamp_image}}<br/><br/></td><td style="width:50%; vertical-align:top;">Le stagiaire'
)
where document_template_id = 'contrat_formation_particulier' and code = 'signatures';

update document_template_sections
set html_template = replace(
  html_template,
  'Date et signature :<br/><br/><br/></td><td style="width:50%; vertical-align:top;">Pour le cocontractant',
  'Date et signature :<br/>{{org_signature_image}}{{org_stamp_image}}<br/><br/></td><td style="width:50%; vertical-align:top;">Pour le cocontractant'
)
where document_template_id = 'convention_formation' and code = 'signatures';

update document_template_sections
set html_template = replace(
  html_template,
  'Signature :<br/><br/><br/></td><td style="width:50%; vertical-align:top;">Le Formateur',
  'Signature :<br/>{{org_signature_image}}{{org_stamp_image}}<br/><br/></td><td style="width:50%; vertical-align:top;">Le Formateur'
)
where document_template_id = 'contrat_sous_traitance' and code = 'signatures';

update document_template_sections
set html_template = replace(
  html_template,
  'Signature :<br/><br/><br/></td><td style="width:50%; vertical-align:top;">Pour l''entreprise partenaire',
  'Signature :<br/>{{org_signature_image}}{{org_stamp_image}}<br/><br/></td><td style="width:50%; vertical-align:top;">Pour l''entreprise partenaire'
)
where document_template_id = 'convention_partenariat' and code = 'signatures';
