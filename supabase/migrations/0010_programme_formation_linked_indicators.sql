-- Renseigne les indicateurs Qualiopi couverts par le document "Programme de
-- formation" (jusqu'ici linked_indicator_numbers = '{}', contrairement aux
-- 15 documents transverses de la migration 0009 qui avaient déjà chacun leur
-- indicateur). Choix basé sur les sections réelles du document
-- (presentation, public, prerequis, objectifs, programme, competences,
-- methodes, evaluation, accessibilite) :
--
--   1  -- information accessible au public (prérequis, objectifs, durée,
--        modalités, accessibilité) : couvert par presentation/public/
--        prerequis/accessibilite.
--   5  -- objectifs opérationnels et évaluables : section "objectifs".
--   6  -- contenus et modalités adaptés aux objectifs et aux publics :
--        sections "programme" et "methodes".
--   9  -- informe les publics des conditions de déroulement : sections
--        "presentation"/"public"/"prerequis".
--   11 -- évalue l'atteinte des objectifs : section "evaluation".
--
-- (Les indicateurs 8 et 10, plus spécifiquement couverts par les
-- questionnaires de positionnement/évaluation à venir, ne sont pas repris
-- ici pour rester sur des indicateurs directement et manifestement couverts
-- par le contenu réel du document.)
update document_templates
set linked_indicator_numbers = array[1, 5, 6, 9, 11]
where id = 'programme_formation';
