-- Permet un upsert idempotent du statut "généré" à chaque régénération de
-- PDF, plutôt que d'accumuler une ligne `documents` par génération.
-- session_id n'est volontairement pas dans la contrainte : les documents
-- liés à une session précise (convocation, émargement…) devront étendre
-- cette contrainte le jour où ils seront ajoutés.
alter table documents
  add constraint documents_org_training_template_unique
  unique (organization_id, training_id, document_template_id);
