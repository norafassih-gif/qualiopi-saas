-- Migration 0022 : indicateur 28 (partenariat entreprise), lot 2 des gaps
-- Phase 5, item 12. Comme pour la sous-traitance (migration 0021), la
-- convention de partenariat n'existait jusqu'ici qu'en trame résumée dans
-- procedure_mobilisation_partenaires (qui reste en place, inchangée). Un vrai
-- audit veut une convention signable à part entière, complète.
--
-- Contenu réel repris du dossier d'audit de Nora (Convention de partenariat —
-- indicateur 28.pdf, structure en 12 points), généricisé. 12 sections
-- numérotées (dont la dernière regroupe les points 10/11/12 — incidents,
-- communication, dispositions diverses — pour rester lisible en PDF).

insert into document_templates (id, label, category_scope, applicable_when, linked_indicator_numbers, folder_group, sort_order, is_active) values
('convention_partenariat', 'Convention de partenariat entreprise', 'all', '{}'::jsonb, ARRAY[28], '06_Procedures', 44, true);

insert into document_template_sections (document_template_id, code, title, sort_order, content_type, html_template, source_content_block_type, content_block_scope) values

('convention_partenariat', 'header', 'Entre les soussignés', 1, 'rich_text', '<p><strong>CONVENTION DE PARTENARIAT</strong></p><p>Entre les soussignés :</p><p>{{company_name}}, organisme de formation, représenté par {{director_name}} ;</p><p>Et …………………………………………………… (entreprise partenaire), représentée par …………………………………………………… , …………………………… (fonction).</p><p>Objet : organiser et encadrer l''accueil d''apprenant(e)s en situation de travail (stage, alternance, immersion, AFEST), co-construire les missions et assurer un suivi pédagogique partagé.</p>', null, 'global'),

('convention_partenariat', 'cadre_objectifs', '1. Cadre et objectifs', 2, 'rich_text', '<p>Référence au programme de formation <strong>{{training_name}}</strong> et aux compétences visées ; annexer la fiche objectifs et activités attendues en entreprise.</p><p>Période : du …………… au ……………. Lieu(x) d''exécution : adresse(s) du site d''accueil.</p>', null, 'global'),

('convention_partenariat', 'engagements_entreprise', '2. Engagements de l''entreprise', 3, 'rich_text', '<p>Accueillir l''apprenant(e) aux dates convenues ; fournir un poste, des moyens et les accès nécessaires.</p><p>Désigner un tuteur référent (nom, fonction, email, téléphone), assurer l''accompagnement et la sécurité ; présenter les règles internes et consignes HSE le premier jour.</p><p>Proposer des missions conformes aux objectifs pédagogiques et au niveau de l''apprenant(e) ; respecter la durée légale et la réglementation applicable.</p>', null, 'global'),

('convention_partenariat', 'engagements_organisme', '3. Engagements de l''organisme', 4, 'rich_text', '<p>{{company_name}} s''engage à assurer le suivi pédagogique et administratif ; fournir les documents de suivi (fiche objectifs, grille d''évaluation, livret de suivi).</p><p>Organiser des points réguliers (fréquence à convenir) avec le tuteur ; intervenir en cas de difficulté.</p>', null, 'global'),

('convention_partenariat', 'temps_presence', '4. Temps, présence et conditions d''accueil', 5, 'rich_text', '<p>Horaires, pauses, télétravail éventuel ; badgeage/pointage le cas échéant.</p><p>Absences et retards : process de signalement (apprenant → tuteur → {{company_name}}).</p>', null, 'global'),

('convention_partenariat', 'sante_securite', '5. Santé, sécurité et responsabilité', 6, 'rich_text', '<p>L''entreprise applique son document unique d''évaluation des risques professionnels (DUERP) et ses règles d''hygiène et de sécurité ; réalise l''accueil sécurité ; fournit les équipements de protection individuelle si requis.</p><p>Assurances : attestation de responsabilité civile de l''entreprise ; l''apprenant(e) est couvert(e) par la protection sociale et la responsabilité civile de {{company_name}} pour l''activité pédagogique ; déclaration d''accident selon le circuit interne.</p>', null, 'global'),

('convention_partenariat', 'confidentialite_propriete', '6. Confidentialité et propriété', 7, 'rich_text', '<p>Confidentialité réciproque sur les informations, données et supports échangés, pendant la durée de la convention et 3 ans après son terme.</p><p>Œuvres, livrables et résultats produits en entreprise : les droits d''usage et d''exploitation sont précisés au cas par cas, dans le respect des droits des tiers.</p>', null, 'global'),

('convention_partenariat', 'donnees_personnelles', '7. Données personnelles (RGPD)', 8, 'rich_text', '<p>Finalités : gestion de la relation tripartite, suivi pédagogique, évaluation. Base légale : exécution du contrat pédagogique / intérêt légitime.</p><p>Chaque partie reste responsable de ses propres traitements ; les échanges de données sont limités au strict nécessaire ; les droits d''accès et de rectification s''exercent auprès du point de contact RGPD de chaque partie ({{dpo_contact_email}} pour {{company_name}}).</p><p>Aucun transfert des données à des tiers sans base légale ni clauses de protection adéquates.</p>', null, 'global'),

('convention_partenariat', 'suivi_evaluation', '8. Suivi, évaluation et attestations', 9, 'rich_text', '<p>Outils de suivi : livret ou fiche de mission, journal de bord, grille d''évaluation du tuteur ; réunion bilan en fin de période.</p><p>Remise d''une attestation d''accueil/mission par l''entreprise ; les retours sont intégrés à l''évaluation de la formation le cas échéant.</p>', null, 'global'),

('convention_partenariat', 'remuneration_frais', '9. Rémunération et frais', 10, 'rich_text', '<p>À préciser selon le cas : gratification, tickets-restaurant, remboursement de frais, et modalités de justificatifs. ☐ Sans objet pour ce partenariat.</p>', null, 'global'),

('convention_partenariat', 'incidents_communication_divers', '10. Incidents et résiliation — 11. Communication — 12. Dispositions diverses', 11, 'rich_text', '<p><strong>10. Incidents, manquements et résiliation</strong><br/>Procédure d''alerte (mail et téléphone) sous 24 h ; mise en place d''un plan d''actions correctives ; possibilité de suspension ou de résiliation en cas de manquement grave, avec information écrite et réunion de clôture. Tout accident fait l''objet d''une déclaration immédiate selon le circuit interne, avec conservation des pièces.</p><p><strong>11. Communication et image</strong><br/>Usage des logos soumis à accord écrit préalable ; validation des contenus mentionnant l''autre partie.</p><p><strong>12. Dispositions diverses</strong><br/>Non-exclusivité du partenariat ; absence de lien de subordination entre l''apprenant(e) et {{company_name}}.<br/>Droit applicable : droit français. Juridiction compétente : {{jurisdiction}}, sauf clause contraire. Entrée en vigueur à la signature.</p>', null, 'global'),

('convention_partenariat', 'signatures', 'Signatures', 12, 'rich_text', '<p>Fait à {{organization_city}}, le {{generated_date}}</p><table style="width:100%; margin-top:8pt;"><tbody><tr><td style="width:50%; vertical-align:top;">Pour {{company_name}}<br/>{{director_name}}<br/><br/>Signature :<br/><br/><br/></td><td style="width:50%; vertical-align:top;">Pour l''entreprise partenaire<br/><br/>Signature :<br/><br/><br/></td></tr></tbody></table><p style="margin-top:6pt; font-size:9pt; color:#6b7280;">Annexes : fiche objectifs/missions, coordonnées du tuteur, planning, grille d''évaluation, consignes HSE d''accueil, mentions RGPD.</p>', null, 'global');
