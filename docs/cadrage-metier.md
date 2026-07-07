# Cadrage métier — GridPulse

Référence interne : vocabulaire **mix électrique** et **intensité carbone** pour cadrer le produit et communiquer sur le périmètre.

**Positionnement :** couche **data / visualisation** sur la niche énergie — complète GreenOps (workflow flex/REC) sans remplacer RTE ni Electricity Maps.

---

## Mix électrique (RTE Eco2Mix)

Le **mix** décrit la répartition de la production électrique en France à un instant donné :

| Source | Idée simple |
|--------|-------------|
| Nucléaire | Base load, production stable |
| Éolien / Solaire | Variable (météo) |
| Hydraulique | Flexible, stockage lacustre |
| Gaz / Charbon | Fossile, utilisé aux pics |
| Bioénergies | Biomasse, déchets |

**Consommation (MW)** : demande instantanée du réseau — ordre de grandeur à afficher, pas une facture client.

**Périmètre assumé :** agrégation de séries temporelles open data RTE pour visualiser l'évolution du mix — pas de pilotage réseau.

---

## Intensité carbone (Electricity Maps)

L'**intensité carbone** (gCO₂/kWh) indique les émissions moyennes liées à 1 kWh consommé sur la zone (ici **FR**), selon le mix instantané et les imports.

- **Bas** (~20–50 g) : beaucoup de nucléaire/renouvelable
- **Élevé** (>400 g) : plus de gaz/charbon ou imports carbonés

**Valeur produit :** croiser mix RTE et intensité carbone pour identifier quand le réseau est « plus vert » — utile pour le flex timing et l'orchestration (FlexSlot).

---

## Lien avec GreenOps (narratif)

| GreenOps | GridPulse |
|----------|-----------|
| Créneaux flex offre/besoin | Contexte réseau (carbone, renouvelable) |
| Workflow métier SaaS | Pipeline data + charts |
| Supabase métier (orgs, RLS) | Supabase séries temporelles |

Pas d'intégration technique V1 — deux repos, une histoire cohérente.

---

## Ce que GridPulse ne fait pas

- Prévision officielle RTE ou météo production
- Recommandation automatique de créneaux flex
- Registre REC, auth multi-tenant, blockchain

---

## Prévision V1 (moving average)

Modèle **baseline** : moyenne des 24 dernières heures d'intensité carbone, projetée sur 12 h.

Documenter clairement : pédagogique, pas production.
