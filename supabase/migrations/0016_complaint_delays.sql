-- Migration 0016 : délais de traitement des réclamations, configurables.
-- Les 87 vrais documents d'audit de Nora montrent un accusé de réception
-- réel engageant des délais précis (48h ouvrées pour l'accusé, 15 jours pour
-- la réponse motivée) — plutôt que de coder ces délais en dur pour tout le
-- monde, on les rend configurables comme les délais de relance anti-abandon
-- (même principe déjà en place, cf. migration 0008).

alter table organizations
  add column complaint_ack_delay text not null default '48h ouvrées',
  add column complaint_response_delay text not null default '15 jours';
