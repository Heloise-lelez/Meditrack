-- ============================================
-- TABLE + POLICIES POUR LES RENDEZ-VOUS (RDV)
-- ============================================
--
-- À coller dans Supabase Studio -> SQL Editor -> Run
-- Objectif: permettre (mode démo, sans auth) de lire/ajouter des rendez-vous.
--
-- La table est volontairement simple et colle aux props déjà utilisées
-- dans `rdv-cards-component.vue` (nom, prenom, profession, operation, date/heure, adresse, photo).
--
create extension if not exists "pgcrypto";

create table if not exists rendezvous (
  id_rendezvous uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  doctor_first_name text not null,
  doctor_last_name text not null,
  profession text not null,
  operation text not null,
  address text not null,
  profile_picture text,

  -- Date/heure du rendez-vous
  starts_at timestamptz not null
);

-- RLS + policies (mode démo sans auth)
alter table rendezvous enable row level security;

drop policy if exists "rendezvous_select_anon" on rendezvous;
create policy "rendezvous_select_anon"
on rendezvous
for select
to anon
using (true);

drop policy if exists "rendezvous_insert_anon" on rendezvous;
create policy "rendezvous_insert_anon"
on rendezvous
for insert
to anon
with check (true);

-- Optionnel (si tu veux modifier/supprimer en mode démo)
drop policy if exists "rendezvous_update_anon" on rendezvous;
create policy "rendezvous_update_anon"
on rendezvous
for update
to anon
using (true)
with check (true);

drop policy if exists "rendezvous_delete_anon" on rendezvous;
create policy "rendezvous_delete_anon"
on rendezvous
for delete
to anon
using (true);

