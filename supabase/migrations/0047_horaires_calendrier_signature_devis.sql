-- Migration 0047 : retours de test client ACP (23/08/2026, Nora) —
-- 1) le programme de formation affiche désormais les dates + horaires de la
--    session (nouvelle variable {{training_schedule_sentence}}, calculée
--    dans lib/engine/document-variables.ts à partir de sessions.start_date/
--    end_date/start_time/end_time — cf. migration 0046) ;
-- 2) le tableau "calendrier détaillé" de la convention et du contrat de
--    formation n'est plus vide par défaut : sa première ligne est
--    pré-remplie automatiquement à partir de la session (nouvelle variable
--    {{schedule_table_row}}), deux lignes vides restent disponibles pour
--    un complément manuel (formation multi-journées non consécutives,
--    plusieurs formateurs...) ;
-- 3) le devis oubliait d'injecter le cachet/la signature de l'organisme
--    dans son bloc "Bon pour accord" (déjà fait sur la convention et le
--    contrat depuis la migration 0029) — corrigé pour être cohérent.
--
-- Migration data pure : ne touche à aucune structure de table, uniquement
-- au texte des modèles (document_template_sections.html_template).

update document_template_sections
set html_template = '<p>Le présent programme est proposé par <strong>{{company_name}}</strong> ({{siret}}) pour la formation <strong>{{training_name}}</strong>, d''une durée de {{training_duration}} heures, dispensée en modalité {{training_modality}}.{{training_schedule_sentence}}</p>'
where document_template_id = 'programme_formation' and code = 'presentation';

update document_template_sections
set html_template = '<p style="color:#6b7280; font-size:9pt;">La première ligne est pré-remplie automatiquement à partir de votre session. Complétez les lignes supplémentaires uniquement si la formation se déroule sur plusieurs journées non consécutives, mêle présentiel et distanciel, ou mobilise plusieurs formateurs.</p><table><thead><tr><th>Date</th><th>Créneau horaire</th><th>Contenu / Module</th><th>Formateur</th><th>Modalité</th></tr></thead><tbody>{{schedule_table_row}}<tr><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td></tr></tbody></table>'
where document_template_id = 'convention_formation' and code = 'calendrier_detaille';

update document_template_sections
set html_template = '<p style="color:#6b7280; font-size:9pt;">La première ligne est pré-remplie automatiquement à partir de votre session. Complétez les lignes supplémentaires uniquement si la formation se déroule sur plusieurs journées non consécutives, mêle présentiel et distanciel, ou mobilise plusieurs formateurs.</p><table><thead><tr><th>Date</th><th>Créneau horaire</th><th>Contenu / Module</th><th>Formateur</th><th>Modalité</th></tr></thead><tbody>{{schedule_table_row}}<tr><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td></tr></tbody></table>'
where document_template_id = 'contrat_formation_particulier' and code = 'calendrier_detaille';

update document_template_sections
set html_template = '<table style="width:100%; margin-top:8pt;"><tbody><tr><td style="width:50%; vertical-align:top;">Pour {{company_name}}<br/>{{director_name}}<br/><br/>Date et signature :<br/>{{org_signature_image}}{{org_stamp_image}}<br/><br/></td><td style="width:50%; vertical-align:top;">Pour le client<br/>{{student_name}} — {{student_company}}<br/><br/>Date et signature (précédée de la mention manuscrite « Bon pour accord ») :<br/><br/><br/></td></tr></tbody></table>'
where document_template_id = 'devis' and code = 'acceptation';
