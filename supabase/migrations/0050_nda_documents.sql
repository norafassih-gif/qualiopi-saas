-- Pièces justificatives du dossier de déclaration d'activité (NDA),
-- générées sur le modèle d'un dossier réel accepté par la DREETS.
-- Nouveau groupe "00_Declaration_activite" : visible seulement pour le
-- parcours NDA (cf. lib/actions/documents.ts).

insert into public.document_templates
  (id, label, category_scope, applicable_when, linked_indicator_numbers, folder_group, sort_order, is_active, tip)
values
  ('nda_description_activite', 'Description succincte de l''activité', 'all', '{}'::jsonb, '{}', '00_Declaration_activite', 1, true,
   'Demandée par Mon Activité Formation quand votre chiffre d''affaires ne dépasse pas 83 600 €.'),
  ('nda_organisation_actions', 'Organisation des actions de formation', 'all', '{}'::jsonb, '{}', '00_Declaration_activite', 3, true,
   'Durée, rythme, calendrier jour par jour, modalités et lieux. À déposer à l''étape « Activité ».'),
  ('nda_moyens_pedagogiques', 'Moyens pédagogiques mobilisés', 'all', '{}'::jsonb, '{}', '00_Declaration_activite', 4, true,
   'Méthodes, outils d''apprentissage, encadrement et ressources. À déposer à l''étape « Activité ».'),
  ('nda_moyens_techniques', 'Moyens techniques mobilisés', 'all', '{}'::jsonb, '{}', '00_Declaration_activite', 5, true,
   'Équipements, outils numériques, prérequis techniques et assistance. À déposer à l''étape « Activité ».'),
  ('nda_documents_contractuels', 'Documents contractuels', 'all', '{}'::jsonb, '{}', '00_Declaration_activite', 7, true,
   'Lien juridique entre chaque formateur et l''organisme. À déposer à l''étape « Formateurs », avec les pièces listées.')
on conflict (id) do nothing;

insert into public.document_template_sections
  (document_template_id, code, title, content_type, sort_order, html_template, content_block_scope, source_content_block_type)
values
-- DESCRIPTION SUCCINCTE
('nda_description_activite', 'intro', 'Présentation de l''organisme', 'rich_text', 1,
 '<p><strong>{{company_name}}</strong>, {{legal_form_label}}, SIRET {{siret}}, dont le siège est situé {{address}}, est dirigé par {{manager_name}} ({{manager_title}}).</p><p>L''organisme exerce une activité de formation professionnelle continue au sens de l''article L. 6313-1 du Code du travail, dans le domaine suivant : {{nda_specialty}}.</p>', 'global', null),
('nda_description_activite', 'offre', 'Action de formation proposée', 'rich_text', 2,
 '<table><tbody><tr><th>Intitulé</th><td>{{training_name}}</td></tr><tr><th>Durée</th><td>{{training_duration}} heures, soit {{nda_days_summary}}</td></tr><tr><th>Modalité</th><td>{{training_modality}}</td></tr><tr><th>Public visé</th><td>{{training_audience}}</td></tr><tr><th>Tarif</th><td>{{price_amount_formatted}} ({{price_unit_label}})</td></tr><tr><th>Délai d''accès</th><td>{{access_delay}}</td></tr></tbody></table>', 'global', null),
('nda_description_activite', 'objectifs', 'Objectifs pédagogiques', 'content_block_list', 3, null, 'training', 'pedagogical_objective'),
('nda_description_activite', 'methodes', 'Méthodes pédagogiques', 'content_block_list', 4, null, 'training', 'method'),
('nda_description_activite', 'evaluation', 'Suivi et évaluation', 'rich_text', 5,
 '<p>Chaque bénéficiaire fait l''objet d''un recueil des besoins et d''un positionnement à l''entrée, d''évaluations en cours de formation et d''une évaluation finale des acquis. L''assiduité est attestée par une feuille d''émargement signée par demi-journée. Une attestation de fin de formation est remise à l''issue de l''action, et un questionnaire de satisfaction est recueilli.</p>', 'global', null),
('nda_description_activite', 'accessibilite', 'Accessibilité', 'rich_text', 6,
 '<p>Les formations sont accessibles aux personnes en situation de handicap. Le référent handicap, {{disability_referent}}, étudie avec chaque bénéficiaire les aménagements nécessaires.</p>', 'global', null),
('nda_description_activite', 'signature', 'Attestation', 'rich_text', 7,
 '<p>Je soussigné(e) {{manager_name}}, {{manager_title}} de {{company_name}}, certifie l''exactitude des informations figurant dans le présent document.</p><p>Fait à {{organization_city}}, le {{generated_date}}</p><p>{{manager_name}}, pour {{company_name}}</p><p>{{org_signature_image}}{{org_stamp_image}}</p>', 'global', null),

-- ORGANISATION DES ACTIONS
('nda_organisation_actions', 'intro', 'Objet', 'rich_text', 1,
 '<p>Le présent document décrit l''organisation des actions de formation dispensées par {{company_name}} : durée, rythme, calendrier, modalités et lieux de déroulement.</p>', 'global', null),
('nda_organisation_actions', 'duree', '1. Durée et rythme', 'rich_text', 2,
 '<table><tbody><tr><th>Action</th><td>{{training_name}}</td></tr><tr><th>Durée</th><td>{{training_duration}} heures de formation effective</td></tr><tr><th>Répartition</th><td>{{nda_days_summary}}</td></tr><tr><th>Horaires</th><td>{{training_hours}}</td></tr><tr><th>Amplitude</th><td>La durée quotidienne n''excède pas 7 heures de formation effective, pauses non comprises.</td></tr><tr><th>Rythme</th><td>Journées consécutives ou espacées selon la demande du commanditaire, sans modification du volume horaire.</td></tr></tbody></table>', 'global', null),
('nda_organisation_actions', 'calendrier', '2. Calendrier de la session', 'rich_text', 3,
 '<table class="register"><thead><tr><th>Date</th><th>Horaires</th><th>Contenu / module</th><th>Formateur</th><th>Modalité, durée</th></tr></thead><tbody>{{nda_calendar_rows}}</tbody></table><p>La présence est attestée par une feuille d''émargement signée par le bénéficiaire et le formateur pour chaque demi-journée.</p>', 'global', null),
('nda_organisation_actions', 'modalites', '3. Modalités de déroulement', 'rich_text', 4,
 '<p><strong>Modalité retenue : {{training_modality}}.</strong> {{nda_modality_sentence}}</p><p>Quelle que soit la modalité, le volume horaire, les objectifs et les modalités d''évaluation restent identiques.</p>', 'global', null),
('nda_organisation_actions', 'lieux', '4. Lieux de déroulement', 'rich_text', 5,
 '<table><tbody><tr><th>Siège de l''organisme</th><td>{{address}}</td></tr><tr><th>Lieu de la session</th><td>{{training_location}}</td></tr><tr><th>Intra-entreprise</th><td>Les formations peuvent se dérouler dans les locaux du client, sous réserve que la salle respecte les conditions d''accueil et de sécurité.</td></tr></tbody></table>', 'global', null),
('nda_organisation_actions', 'accessibilite', '5. Accessibilité et conditions d''accueil', 'rich_text', 6,
 '<p>Les lieux sont choisis en tenant compte de l''accessibilité aux personnes en situation de handicap. Le besoin est identifié lors du recueil des besoins. Le référent handicap, {{disability_referent}}, est l''interlocuteur pour toute demande d''aménagement (matériel, rythme, durée, accessibilité). À défaut d''adaptation possible, une solution alternative est recherchée : changement de salle, passage à distance ou orientation vers un partenaire.</p>', 'global', null),
('nda_organisation_actions', 'acces', '6. Délai d''accès et inscription', 'rich_text', 7,
 '<table><tbody><tr><th>Délai d''accès</th><td>{{access_delay}}</td></tr><tr><th>Étapes</th><td>Demande du bénéficiaire ou de l''entreprise, recueil des besoins, positionnement à l''entrée, devis, convention ou contrat de formation, convocation.</td></tr><tr><th>Documents remis avant la formation</th><td>Programme de formation, règlement intérieur, livret d''accueil, convocation précisant dates, horaires et lieu.</td></tr></tbody></table><p>Fait à {{organization_city}}, le {{generated_date}}<br/>{{manager_name}}, pour {{company_name}}</p>', 'global', null),

-- MOYENS PÉDAGOGIQUES
('nda_moyens_pedagogiques', 'intro', 'Objet', 'rich_text', 1,
 '<p>Le présent document décrit les méthodes pédagogiques mises en œuvre par {{company_name}}, les outils d''apprentissage, les moyens d''encadrement et les ressources mises à disposition des apprenants.</p>', 'global', null),
('nda_moyens_pedagogiques', 'methodes_cadre', '1. Méthodes pédagogiques', 'rich_text', 2,
 '<p>La pédagogie est active et centrée sur la pratique professionnelle des participants. Les apports théoriques n''excèdent pas la moitié du temps de formation.</p><table class="register"><thead><tr><th>Méthode</th><th>Mise en œuvre</th><th>Part indicative</th></tr></thead><tbody><tr><td>Affirmative et démonstrative</td><td>Apports structurés, présentation de modèles et de repères, illustrations commentées</td><td>30 %</td></tr><tr><td>Active et expérientielle</td><td>Mises en situation, études de cas, exercices pratiques, travaux en sous-groupes</td><td>45 %</td></tr><tr><td>Interrogative et réflexive</td><td>Questionnement, auto-diagnostics, débriefs collectifs</td><td>25 %</td></tr></tbody></table><p>Chaque séquence suit la même progression : un apport court, une mise en pratique, un débrief, puis un transfert vers la situation de travail du participant.</p>', 'global', null),
('nda_moyens_pedagogiques', 'methodes_domaine', 'Méthodes propres à la formation', 'content_block_list', 3, null, 'training', 'method'),
('nda_moyens_pedagogiques', 'exercices', '2. Outils d''apprentissage et exercices', 'content_block_list', 4, null, 'training', 'exercise'),
('nda_moyens_pedagogiques', 'outils', 'Supports', 'rich_text', 5,
 '<ul><li>Supports de présentation conçus par le formateur et mis à jour à chaque session.</li><li>Fiches outils et fiches de synthèse remises à chaque participant.</li><li>Quiz de positionnement, quiz intermédiaire et quiz final d''évaluation des acquis.</li><li>Plan d''action individuel construit en fin de parcours.</li></ul>', 'global', null),
('nda_moyens_pedagogiques', 'techniques', '3. Moyens techniques', 'rich_text', 6,
 '<p><strong>Modalité : {{training_modality}}.</strong> {{nda_modality_sentence}}</p><p>Prérequis technique : {{nda_tech_prereq}}</p>', 'global', null),
('nda_moyens_pedagogiques', 'encadrement', '4. Moyens d''encadrement', 'rich_text', 7,
 '<table><tbody><tr><th>Formateur</th><td>{{trainer_name}}, qui assure la conception et l''animation des actions de formation.</td></tr><tr><th>Suivi des participants</th><td>Accueil et présentation du cadre en début de session, point d''étape à mi-parcours, entretien individuel de fin de formation.</td></tr><tr><th>Référent pédagogique</th><td>{{pedagogical_referent}}</td></tr><tr><th>Référent handicap</th><td>{{disability_referent}}</td></tr></tbody></table>', 'global', null),
('nda_moyens_pedagogiques', 'ressources', '5. Ressources mises à disposition', 'rich_text', 8,
 '<ul><li>L''ensemble des supports projetés et des fiches outils.</li><li>Une sélection de ressources complémentaires sur le thème de la formation.</li><li>La possibilité de solliciter le formateur par e-mail pendant les trois mois qui suivent la formation.</li><li>Le livret d''accueil, le règlement intérieur et le programme, remis avant l''entrée en formation.</li></ul>', 'global', null),
('nda_moyens_pedagogiques', 'handicap', '6. Adaptation aux situations de handicap', 'rich_text', 9,
 '<p>Les moyens décrits peuvent être adaptés selon les besoins identifiés lors du recueil des besoins : agrandissement des supports, transmission des documents en amont, aménagement du rythme et des pauses, salle accessible ou passage à distance. Le référent handicap mobilise si nécessaire l''Agefiph et le réseau Ressource Handicap Formation.</p><p>Fait à {{organization_city}}, le {{generated_date}}<br/>{{manager_name}}, pour {{company_name}}</p>', 'global', null),

-- MOYENS TECHNIQUES
('nda_moyens_techniques', 'intro', 'Objet', 'rich_text', 1,
 '<p>Le présent document précise les équipements mobilisés, les outils numériques utilisés, les prérequis techniques demandés aux apprenants et l''assistance mise à leur disposition.</p>', 'global', null),
('nda_moyens_techniques', 'equipements', '1. Équipements', 'rich_text', 2,
 '<table class="register"><thead><tr><th>Équipement</th><th>Usage</th><th>Fourni par</th></tr></thead><tbody>{{nda_equipment_rows}}</tbody></table>', 'global', null),
('nda_moyens_techniques', 'outils', '2. Outils numériques', 'rich_text', 3,
 '<table class="register"><thead><tr><th>Outil</th><th>Usage</th><th>Accès</th></tr></thead><tbody>{{nda_tools_rows}}</tbody></table><p>Aucun logiciel payant ni installation particulière n''est demandé aux participants.</p>', 'global', null),
('nda_moyens_techniques', 'prerequis', '3. Prérequis techniques pour les apprenants', 'rich_text', 4,
 '<p>{{nda_tech_prereq}}</p>', 'global', null),
('nda_moyens_techniques', 'assistance', '4. Assistance technique', 'rich_text', 5,
 '<table><tbody><tr><th>Interlocuteur</th><td>{{manager_name}} : {{email}}, {{phone}}</td></tr><tr><th>Avant la session</th><td>Transmission des informations pratiques (et du lien de connexion pour le distanciel) au moins 48 heures avant le démarrage.</td></tr><tr><th>Pendant la session</th><td>Assistance joignable par téléphone pendant toute la durée de la formation.</td></tr><tr><th>Incident majeur</th><td>La séquence est reprogrammée sans frais pour le bénéficiaire. L''incident est tracé et traité au titre de l''amélioration continue.</td></tr><tr><th>Délai de réponse</th><td>Toute demande d''assistance reçoit une réponse sous 24 heures ouvrées.</td></tr></tbody></table>', 'global', null),
('nda_moyens_techniques', 'tracabilite', '5. Traçabilité et données', 'rich_text', 6,
 '<ul><li>L''assiduité est tracée par l''émargement signé par demi-journée (et les relevés de connexion à distance).</li><li>Les questionnaires et quiz sont horodatés et conservés pendant la durée d''archivage prévue.</li><li>Les données personnelles des participants sont traitées conformément au RGPD, dans le seul cadre de l''exécution de l''action de formation.</li></ul>', 'global', null),
('nda_moyens_techniques', 'handicap', '6. Adaptation aux situations de handicap', 'rich_text', 7,
 '<p>Les moyens techniques sont adaptés selon les besoins identifiés avant l''entrée en formation : envoi anticipé et agrandissement des supports, sous-titrage en classe virtuelle, salle accessible de plain-pied, aménagement des pauses. Le référent handicap, {{disability_referent}}, mobilise si nécessaire l''Agefiph et le réseau Ressource Handicap Formation.</p><p>Fait à {{organization_city}}, le {{generated_date}}<br/>{{manager_name}}, pour {{company_name}}</p>', 'global', null),

-- DOCUMENTS CONTRACTUELS
('nda_documents_contractuels', 'intro', 'Objet', 'rich_text', 1,
 '<p>Le présent document recense les personnes intervenant pour le compte de {{company_name}} et précise, pour chacune, la nature de son lien juridique avec l''organisme ainsi que la pièce justificative correspondante, jointe en annexe.</p>', 'global', null),
('nda_documents_contractuels', 'intervenants', '1. Intervenants et liens contractuels', 'rich_text', 2,
 '<table class="register"><thead><tr><th>Nom et prénom</th><th>Rôle dans l''organisme</th><th>Nature du lien</th><th>Pièce justificative jointe</th></tr></thead><tbody>{{nda_contract_rows}}</tbody></table><p>{{nda_subcontracting_sentence}}</p>', 'global', null),
('nda_documents_contractuels', 'pieces', '2. Pièces jointes au dossier', 'rich_text', 3,
 '<ul>{{nda_contract_pieces}}</ul>', 'global', null),
('nda_documents_contractuels', 'evolution', '3. Engagements en cas d''évolution', 'rich_text', 4,
 '<ul><li>Recrutement d''un salarié : un contrat de travail signé sera établi et joint au dossier, avec le CV et les justificatifs de diplômes.</li><li>Recours à un formateur indépendant : un contrat de sous-traitance d''enseignement sera signé avant toute intervention ; l''intervenant fournira son justificatif d''immatriculation, son CV et ses diplômes.</li><li>La liste des formateurs et le présent document seront actualisés à chaque entrée ou sortie d''intervenant.</li></ul>', 'global', null),
('nda_documents_contractuels', 'attestation', '4. Attestation', 'rich_text', 5,
 '<p>Je soussigné(e) {{manager_name}}, {{manager_title}} de {{company_name}}, atteste sur l''honneur que les informations figurant dans le présent document sont exactes, que les pièces jointes sont conformes aux originaux, et que toute personne intervenant pour le compte de l''organisme sera liée à celui-ci par un contrat écrit préalable à son intervention.</p><p>Fait à {{organization_city}}, le {{generated_date}}<br/>{{manager_name}}, pour {{company_name}}</p><p>{{org_signature_image}}{{org_stamp_image}}</p>', 'global', null);
