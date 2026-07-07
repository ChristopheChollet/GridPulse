Christophe Chollet
Développeur Full-Stack / Product Engineer
Spécialisation : SaaS, Pipelines Data & GreenOps (Énergie & Climat)

Profil
Développeur Full-Stack au profil T-shaped, spécialisé dans l'architecture d'applications SaaS B2B et le traitement de données. Alliant une forte culture Produit et une maîtrise technique moderne (Next.js, TypeScript, FastAPI, PostgreSQL), j'ai conçu **Meridian**, une plateforme ops modulaire sur la niche Énergie/Climat : **trois services en production** (GridPulse → FlexSlot → GreenOps) et un **quatrième pilier billing** (VoltFlow, roadmap). Mon expertise me permet d'intervenir sur l'ensemble du cycle de vie d'un produit Web, de la modélisation de bases de données aux intégrations inter-services.

Disponible immédiatement pour des opportunités en Remote complet ou Hybride (Toulouse).

Expériences professionnelles
Développeur Full-Stack — Meridian (plateforme ops énergie & climat) — 2025–2026

Architecture modulaire en **quatre bounded contexts** (repos et déploiements distincts), **trois briques livrées en production** sur Vercel / Railway / Supabase. Intégrations inter-services réelles (API REST, clés service, traçabilité bout en bout).

**GreenOps** (SaaS ops · prod) — Console B2B multi-tenant : auth Magic Link, RBAC, dashboard KPI, flexibilité (créneaux offre/besoin), registre REC (démo), équipe et exports PDF/CSV. PostgreSQL + RLS, piste d'audit, API d'intégration `POST /api/integrations/flex-slots` pour FlexSlot (`source`, score GridPulse, action recommandée).

**GridPulse** (data réseau · prod) — Pipeline ETL (RTE, Electricity Maps) via GitHub Actions ; API FastAPI (`GET /api/v1/green-windows`) ; dashboards mix/carbone, créneaux verts, prévision baseline, observabilité `/status`. Stack : Next.js, FastAPI, Python, Pandas, Supabase, Recharts.

**FlexSlot** (orchestration · prod) — Pont GridPulse → GreenOps : moteur de recommandations (consommer / flex / décaler), création de slot en un clic via Server Actions et clé service, historique Supabase (`/history`), export PDF, alertes webhook V2.1.

**VoltFlow** (facturation · roadmap) — Architecture définie pour le pilier 4 : micro-service FastAPI de facturation à l'usage (Stripe metered billing, règles HP-HC/spot simplifiées, traçabilité `flex_slot_id` → ligne de facturation). **Non livré** — conception et cadrage technique.

Stack transverse : Next.js (App Router), TypeScript, Tailwind CSS, Supabase, PostgreSQL, FastAPI, Vercel, Railway, GitHub Actions.

Freelance graphisme & communication visuelle — 2018–2021
Comeup Freelance

Réalisation d'identités visuelles et interfaces. Gestion autonome du cycle client.

Compétences transférables : Autonomie, sens aigu de l'UX/UI et clarté des interfaces (atout majeur pour le design de dashboards SaaS).

Diplômes et formations
Certification Développeur IA & Blockchain — 2025–2026
Alyra Online — Certificat RNCP RS6515

Socle Full-Stack (Next.js, TypeScript), IA (Cursor, Copilot), Blockchain (Solidity).

Focus post-certification : Architecture SaaS métier, intégrations Data/Billing et orchestration inter-services.

Master Infographie — 2015–2020
HEAJ Namur, Belgique

Compétences techniques
Full-Stack & Architecture : Applications B2B / SaaS · Systèmes Multi-tenant · APIs REST · Intégrations inter-services · Cycle complet de conception.

Frontend & Produit : Next.js, React, TypeScript, Tailwind CSS, Recharts, Design d'interfaces UI/UX.

Backend & Data : FastAPI, Python, Pandas, Server Actions, Traitement de séries temporelles, Pipelines ETL.

Bases de données & Sécurité : PostgreSQL, Supabase, Row Level Security (RLS), Authentification, clés service.

DevOps & Intégrations : Vercel, Railway, GitHub Actions, Stripe API (roadmap VoltFlow), Webhooks, Gestion d'API tierces.

Expertise Métier (Énergie) : Flexibilité réseau, créneaux offre/besoin, certificats REC, mix électrique, tarification dynamique.

Productivité : Maîtrise des assistants de code (Cursor, Copilot).

Langues & Soft Skills
Langues : Français (maternelle) · Anglais (courant).

Savoir-être : Autonomie technique, rigueur, esprit d'analyse, sens du service client, communication transparente, respect des délais.
