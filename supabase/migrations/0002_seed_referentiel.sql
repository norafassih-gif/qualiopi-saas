-- ============================================================================
-- Seed du référentiel Qualiopi (7 critères, 32 indicateurs) et des 10 catégories
-- Source : guide_de_lecture_qualiopi_v8_du_23_novembre_20233.pdf (texte officiel,
-- transcrit verbatim depuis le sommaire du guide) — voir claude/conception-moteur-v1.md
-- ============================================================================

insert into qualiopi_criteria (number, title) values
(1, 'Les conditions d''information du public sur les prestations proposées, les délais pour y accéder et les résultats obtenus'),
(2, 'L''identification précise des objectifs des prestations proposées et l''adaptation de ces prestations aux publics bénéficiaires lors de la conception des prestations'),
(3, 'L''adaptation aux publics bénéficiaires des prestations et des modalités d''accueil, d''accompagnement, de suivi et d''évaluation mises en œuvre'),
(4, 'L''adéquation des moyens pédagogiques, techniques et d''encadrement aux prestations mises en œuvre'),
(5, 'La qualification et le développement des connaissances et compétences des personnels chargés de mettre en œuvre les prestations'),
(6, 'L''inscription et l''investissement du prestataire dans son environnement professionnel'),
(7, 'Le recueil et la prise en compte des appréciations et des réclamations formulées par les parties prenantes aux prestations délivrées');

insert into qualiopi_indicators (number, criterion_id, title) values
(1, 1, 'Le prestataire diffuse une information accessible au public, détaillée et vérifiable sur les prestations proposées : prérequis, objectifs, durée, modalités et délais d''accès, tarifs, contacts, méthodes mobilisées et modalités d''évaluation, accessibilité aux personnes handicapées.'),
(2, 1, 'Le prestataire diffuse des indicateurs de résultats adaptés à la nature des prestations mises en œuvre et des publics accueillis.'),
(3, 1, 'Lorsque le prestataire met en œuvre des prestations conduisant à une certification professionnelle, il informe sur les taux d''obtention des certifications préparées, les possibilités de valider un/ou des blocs de compétences, ainsi que sur les équivalences, passerelles, suites de parcours et les débouchés.'),
(4, 2, 'Le prestataire analyse le besoin du bénéficiaire en lien avec l''entreprise et/ou le financeur concerné(s).'),
(5, 2, 'Le prestataire définit les objectifs opérationnels et évaluables de la prestation.'),
(6, 2, 'Le prestataire établit les contenus et les modalités de mise en œuvre de la prestation, adaptés aux objectifs définis et aux publics bénéficiaires.'),
(7, 2, 'Lorsque le prestataire met en œuvre des prestations conduisant à une certification professionnelle, il s''assure de l''adéquation du ou des contenus de la prestation aux exigences de la certification visée.'),
(8, 2, 'Le prestataire détermine les procédures de positionnement et d''évaluation des acquis à l''entrée de la prestation.'),
(9, 3, 'Le prestataire informe les publics bénéficiaires des conditions de déroulement de la prestation.'),
(10, 3, 'Le prestataire met en œuvre et adapte la prestation, l''accompagnement et le suivi aux publics bénéficiaires.'),
(11, 3, 'Le prestataire évalue l''atteinte par les publics bénéficiaires des objectifs de la prestation.'),
(12, 3, 'Le prestataire décrit et met en œuvre les mesures pour favoriser l''engagement des bénéficiaires et prévenir les ruptures de parcours.'),
(13, 3, 'Pour les formations en alternance, le prestataire, en lien avec l''entreprise, anticipe avec l''apprenant les missions confiées, à court, moyen et long terme, et assure la coordination et la progressivité des apprentissages réalisés en centre de formation et en entreprise.'),
(14, 3, 'Le prestataire met en œuvre un accompagnement socio-professionnel, éducatif et relatif à l''exercice de la citoyenneté.'),
(15, 3, 'Le prestataire informe les apprentis de leurs droits et devoirs en tant qu''apprentis et salariés ainsi que des règles applicables en matière de santé et de sécurité en milieu professionnel.'),
(16, 3, 'Lorsque le prestataire met en œuvre des formations conduisant à une certification professionnelle, il s''assure que les conditions de présentation des bénéficiaires à la certification respectent les exigences formelles de l''autorité de certification.'),
(17, 4, 'Le prestataire met à disposition ou s''assure de la mise à disposition des moyens humains et techniques adaptés et d''un environnement approprié (conditions, locaux, équipements, plateaux techniques…).'),
(18, 4, 'Le prestataire mobilise et coordonne les différents intervenants internes et/ou externes (pédagogiques, administratifs, logistiques, commerciaux…).'),
(19, 4, 'Le prestataire met à disposition du bénéficiaire des ressources pédagogiques et permet à celui-ci de se les approprier.'),
(20, 4, 'Le prestataire dispose d''un personnel dédié à l''appui à la mobilité nationale et internationale, d''un référent handicap et d''un conseil de perfectionnement.'),
(21, 5, 'Le prestataire détermine, mobilise et évalue les compétences des différents intervenants internes et/ou externes, adaptées aux prestations.'),
(22, 5, 'Le prestataire entretient et développe les compétences de ses salariés, adaptées aux prestations qu''il délivre.'),
(23, 6, 'Le prestataire réalise une veille légale et réglementaire sur le champ de la formation professionnelle et en exploite les enseignements.'),
(24, 6, 'Le prestataire réalise une veille sur les évolutions des compétences, des métiers et des emplois dans ses secteurs d''intervention et en exploite les enseignements.'),
(25, 6, 'Le prestataire réalise une veille sur les innovations pédagogiques et technologiques permettant une évolution de ses prestations et en exploite les enseignements.'),
(26, 6, 'Le prestataire mobilise les expertises, outils et réseaux nécessaires pour accueillir, accompagner/former ou orienter les publics en situation de handicap.'),
(27, 6, 'Lorsque le prestataire fait appel à la sous-traitance ou au portage salarial, il s''assure du respect de la conformité au présent référentiel.'),
(28, 6, 'Lorsque les prestations dispensées au bénéficiaire comprennent des périodes de formation en situation de travail, le prestataire mobilise son réseau de partenaires socio-économiques pour coconstruire l''ingénierie de formation et favoriser l''accueil en entreprise.'),
(29, 6, 'Le prestataire développe des actions qui concourent à l''insertion professionnelle ou la poursuite d''étude par la voie de l''apprentissage ou par toute autre voie permettant de développer leurs connaissances et leurs compétences.'),
(30, 7, 'Le prestataire recueille les appréciations des parties prenantes : bénéficiaires, financeurs, équipes pédagogiques et entreprise concernées.'),
(31, 7, 'Le prestataire met en œuvre des modalités de traitement des difficultés rencontrées par les parties prenantes, des réclamations exprimées par ces dernières, des aléas survenus en cours de prestation.'),
(32, 7, 'Le prestataire met en œuvre des mesures d''amélioration à partir de l''analyse des appréciations et des réclamations.');

-- =========================================================
-- 10 catégories de formation (point 12 de la conception)
-- =========================================================
insert into training_categories (id, label, description, sort_order) values
('langues', 'Langues', 'Anglais, français langue étrangère, autres langues — préparation certifications type TOEIC, DELF/DALF', 1),
('community_management', 'Community Management / Réseaux sociaux', 'Stratégie social media, création de contenu, animation de communauté', 2),
('marketing_digital', 'Marketing digital', 'SEO, SEA, emailing, growth, analytics, stratégie de contenu', 3),
('management', 'Management', 'Leadership, délégation, gestion de conflits, animation d''équipe', 4),
('vente_commerce', 'Vente / Commerce', 'Prospection, négociation commerciale, relation client, CRM', 5),
('bureautique', 'Bureautique', 'Excel, Word, PowerPoint, outils collaboratifs', 6),
('communication', 'Communication', 'Communication écrite/orale, prise de parole, communication de crise', 7),
('web_digital', 'Web / Création de sites', 'HTML/CSS, CMS, WordPress, UX/UI de base, no-code', 8),
('ressources_humaines', 'Ressources humaines', 'Recrutement, droit du travail, entretiens annuels, SIRH', 9),
('entrepreneuriat_gestion', 'Entrepreneuriat / Gestion', 'Business plan, gestion financière, statuts juridiques, comptabilité de base', 10);

-- =========================================================
-- NOTE — banques de contenu (content_blocks / modules / questions / rules /
-- document_templates) : à importer séparément via un script dédié qui lit
-- claude/banque-contenu-community-management.md et claude/banque-procedures-transverses.md
-- (transcription manuelle en SQL trop risquée d'erreurs vu le volume — prévoir
-- un script Node de parsing + insertion, cf. Phase 2 et Phase 7 de la conception).
-- =========================================================
