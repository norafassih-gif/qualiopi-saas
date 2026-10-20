-- Migration 0083 : banque QCM du domaine Froid et climatisation (20 questions).
--
-- Contexte : formation "Maitrise des Installations Frigorifiques" de PREXIA
-- FORMATION (audit initial, octobre 2026), reutilisable pour les prochains
-- clients du domaine froid_climatisation.
--
-- IMPORTANT : questions ET corrige REDIGES PAR CLAUDE (connaissance generale
-- du froid et de la climatisation), alignes sur les 3 journees de la formation
-- (fonctionnement et conception / diagnostic et audit / DESP-PED). Aucune
-- reponse de stagiaire n'est pre-remplie. A FAIRE RELIRE PAR LE FORMATEUR
-- (Amine JAKHJOUKH) avant usage reel en audit, en particulier les questions
-- Q18 a Q20 (DESP/PED) dont les references reglementaires sont a confirmer sur
-- EUR-Lex et Legifrance. Les questions evitent volontairement les chiffres qui
-- evoluent (quotas, echeances F-Gas) pour rester valables dans le temps.

insert into evaluation_questions (id, category_id, topic, question_text, sort_order) values
('FROID_Q01', 'froid_climatisation', 'Principes du froid', 'Dans un cycle frigorifique à compression de vapeur, quel est l''ordre des transformations subies par le fluide, en partant du compresseur ?', 1),
('FROID_Q02', 'froid_climatisation', 'Principes du froid', 'Dans quel composant le fluide frigorigène absorbe-t-il la chaleur du milieu à refroidir ?', 2),
('FROID_Q03', 'froid_climatisation', 'Principes du froid', 'Quel est le rôle du détendeur ?', 3),
('FROID_Q04', 'froid_climatisation', 'Principes du froid', 'Que représente la surchauffe en sortie d''évaporateur ?', 4),
('FROID_Q05', 'froid_climatisation', 'Principes du froid', 'Que représente le sous-refroidissement en sortie de condenseur ?', 5),
('FROID_Q06', 'froid_climatisation', 'Composants', 'Quel est le rôle du filtre déshydrateur sur la ligne liquide ?', 6),
('FROID_Q07', 'froid_climatisation', 'Fluides frigorigènes', 'Que mesure le PRP (potentiel de réchauffement planétaire) d''un fluide frigorigène ?', 7),
('FROID_Q08', 'froid_climatisation', 'Fluides frigorigènes', 'Que doit-on faire du fluide frigorigène présent dans une installation que l''on met hors service ?', 8),
('FROID_Q09', 'froid_climatisation', 'Fluides frigorigènes', 'À quoi servent les contrôles d''étanchéité périodiques d''une installation ?', 9),
('FROID_Q10', 'froid_climatisation', 'Sécurité', 'Que signifie la classe de sécurité A2L d''un fluide frigorigène ?', 10),
('FROID_Q11', 'froid_climatisation', 'Conception', 'Quelle donnée de départ est indispensable pour dimensionner une installation frigorifique ?', 11),
('FROID_Q12', 'froid_climatisation', 'Installation', 'Pourquoi tire-t-on au vide un circuit frigorifique avant de le charger en fluide ?', 12),
('FROID_Q13', 'froid_climatisation', 'Installation', 'Quelle opération doit précéder le tirage au vide et la charge d''un circuit neuf ?', 13),
('FROID_Q14', 'froid_climatisation', 'Diagnostic', 'Une basse pression trop faible associée à une forte surchauffe à l''aspiration évoque en premier lieu :', 14),
('FROID_Q15', 'froid_climatisation', 'Diagnostic', 'Quelle conséquence est généralement observée lorsque le condenseur à air est fortement encrassé ?', 15),
('FROID_Q16', 'froid_climatisation', 'Audit et performances', 'Que mesure le COP (coefficient de performance) d''une machine frigorifique ou d''une pompe à chaleur ?', 16),
('FROID_Q17', 'froid_climatisation', 'Audit et performances', 'Quel élément fait partie d''un audit technique d''une installation frigorifique ?', 17),
('FROID_Q18', 'froid_climatisation', 'DESP/PED', 'La directive sur les équipements sous pression (DESP/PED) s''applique aux équipements dont la pression maximale admissible PS est supérieure à :', 18),
('FROID_Q19', 'froid_climatisation', 'DESP/PED', 'De quoi dépend notamment le classement d''un équipement sous pression dans une catégorie (I à IV) ?', 19),
('FROID_Q20', 'froid_climatisation', 'DESP/PED', 'Combien de temps le fabricant doit-il conserver la documentation technique et la déclaration UE de conformité d''un équipement sous pression ?', 20);

insert into evaluation_answer_options (question_id, label, is_correct, sort_order) values
('FROID_Q01', 'Compression, évaporation, détente, condensation', false, 1),
('FROID_Q01', 'Compression, condensation, détente, évaporation', true, 2),
('FROID_Q01', 'Détente, compression, condensation, évaporation', false, 3),
('FROID_Q01', 'Condensation, compression, évaporation, détente', false, 4),

('FROID_Q02', 'Le condenseur', false, 1),
('FROID_Q02', 'Le compresseur', false, 2),
('FROID_Q02', 'L''évaporateur', true, 3),
('FROID_Q02', 'Le détendeur', false, 4),

('FROID_Q03', 'Augmenter la pression du fluide avant le condenseur', false, 1),
('FROID_Q03', 'Abaisser la pression du fluide et alimenter l''évaporateur de façon régulée', true, 2),
('FROID_Q03', 'Retenir l''humidité et les impuretés du circuit', false, 3),
('FROID_Q03', 'Stocker le fluide à l''état liquide', false, 4),

('FROID_Q04', 'L''écart entre la température de la vapeur à l''aspiration et la température de saturation à la pression d''évaporation', true, 1),
('FROID_Q04', 'L''écart entre la température de refoulement et la température ambiante', false, 2),
('FROID_Q04', 'L''écart entre la température de condensation et la température de l''air extérieur', false, 3),
('FROID_Q04', 'La température maximale atteinte par l''huile du compresseur', false, 4),

('FROID_Q05', 'L''écart entre la température de l''air et celle de l''évaporateur', false, 1),
('FROID_Q05', 'L''écart entre la température de refoulement et la température d''aspiration', false, 2),
('FROID_Q05', 'L''écart entre la température de saturation à la pression de condensation et la température du liquide en sortie du condenseur', true, 3),
('FROID_Q05', 'La baisse de température de l''air dans la chambre froide', false, 4),

('FROID_Q06', 'Mesurer le débit de fluide', false, 1),
('FROID_Q06', 'Augmenter la pression de condensation', false, 2),
('FROID_Q06', 'Séparer l''huile du fluide frigorigène', false, 3),
('FROID_Q06', 'Retenir l''humidité et les impuretés présentes dans le circuit', true, 4),

('FROID_Q07', 'La toxicité du fluide pour l''être humain', false, 1),
('FROID_Q07', 'La contribution du fluide à l''effet de serre par rapport au CO2', true, 2),
('FROID_Q07', 'Son action sur la couche d''ozone uniquement', false, 3),
('FROID_Q07', 'Sa pression de fonctionnement à 20 °C', false, 4),

('FROID_Q08', 'Le laisser s''échapper dans l''atmosphère', false, 1),
('FROID_Q08', 'Le récupérer dans une bouteille adaptée et le confier à une filière de traitement', true, 2),
('FROID_Q08', 'Le réutiliser dans n''importe quelle autre installation sans contrôle', false, 3),
('FROID_Q08', 'Le diluer dans l''eau de rinçage', false, 4),

('FROID_Q09', 'À détecter et faire réparer les fuites de fluide', true, 1),
('FROID_Q09', 'À améliorer le rendement du compresseur', false, 2),
('FROID_Q09', 'À régler la surchauffe', false, 3),
('FROID_Q09', 'À vérifier la couleur de l''huile', false, 4),

('FROID_Q10', 'Fluide non toxique et non inflammable', false, 1),
('FROID_Q10', 'Fluide toxique et très inflammable', false, 2),
('FROID_Q10', 'Fluide de faible toxicité et faiblement inflammable', true, 3),
('FROID_Q10', 'Fluide de faible toxicité et très inflammable', false, 4),

('FROID_Q11', 'La marque de l''évaporateur', false, 1),
('FROID_Q11', 'Le bilan des apports thermiques du local ou de la chambre à refroidir', true, 2),
('FROID_Q11', 'La couleur de l''isolant', false, 3),
('FROID_Q11', 'Le poids du compresseur', false, 4),

('FROID_Q12', 'Pour éliminer l''air et l''humidité du circuit', true, 1),
('FROID_Q12', 'Pour augmenter la pression dans le circuit', false, 2),
('FROID_Q12', 'Pour refroidir l''huile du compresseur', false, 3),
('FROID_Q12', 'Pour remplacer le filtre déshydrateur', false, 4),

('FROID_Q13', 'Le démarrage du compresseur à pleine charge', false, 1),
('FROID_Q13', 'Un essai d''étanchéité du circuit', true, 2),
('FROID_Q13', 'Le remplacement du détendeur', false, 3),
('FROID_Q13', 'La mise en route des ventilateurs de condenseur', false, 4),

('FROID_Q14', 'Un excès de fluide dans le circuit', false, 1),
('FROID_Q14', 'Un condenseur encrassé', false, 2),
('FROID_Q14', 'Un manque de fluide ou un détendeur sous-alimenté', true, 3),
('FROID_Q14', 'Un ventilateur de condenseur en survitesse', false, 4),

('FROID_Q15', 'Une baisse de la pression de condensation', false, 1),
('FROID_Q15', 'Une hausse de la pression de condensation et une baisse du rendement', true, 2),
('FROID_Q15', 'Une baisse de la température de refoulement', false, 3),
('FROID_Q15', 'Une amélioration du COP', false, 4),

('FROID_Q16', 'La puissance électrique maximale du compresseur', false, 1),
('FROID_Q16', 'La durée de vie du fluide frigorigène', false, 2),
('FROID_Q16', 'Le rapport entre la puissance utile fournie et la puissance électrique consommée', true, 3),
('FROID_Q16', 'Le débit d''air traversant l''évaporateur', false, 4),

('FROID_Q17', 'Le relevé des paramètres de fonctionnement et leur comparaison avec les valeurs attendues', true, 1),
('FROID_Q17', 'Le choix de la couleur des tuyauteries', false, 2),
('FROID_Q17', 'La rédaction d''un contrat de vente du fluide', false, 3),
('FROID_Q17', 'Le remplacement systématique du compresseur', false, 4),

('FROID_Q18', '0,1 bar', false, 1),
('FROID_Q18', '0,5 bar', true, 2),
('FROID_Q18', '5 bar', false, 3),
('FROID_Q18', '50 bar', false, 4),

('FROID_Q19', 'De la couleur et du poids de l''équipement', false, 1),
('FROID_Q19', 'Du nombre de techniciens qui interviennent', false, 2),
('FROID_Q19', 'De la pression, du volume ou du diamètre nominal, et du groupe de fluide', true, 3),
('FROID_Q19', 'Du prix d''achat de l''équipement', false, 4),

('FROID_Q20', '10 ans après la mise sur le marché', true, 1),
('FROID_Q20', '1 an après la mise sur le marché', false, 2),
('FROID_Q20', 'Jusqu''à la première inspection périodique seulement', false, 3),
('FROID_Q20', 'Aucune durée de conservation n''est exigée', false, 4);
