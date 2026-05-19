<p align="center">
  <img src="docs/assets/meditrack-hero.svg" alt="Meditrack, suivi du parcours chirurgical" width="100%">
</p>

<h1 align="center">Meditrack</h1>

<p align="center">
  Application web de suivi du parcours chirurgical, pensée pour rendre chaque étape plus claire, plus accessible et plus simple à consulter.
</p>

<p align="center">
  <img alt="Vue.js" src="https://img.shields.io/badge/Vue.js-3-42b883?style=flat-square">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-7-646cff?style=flat-square">
  <img alt="Express" src="https://img.shields.io/badge/Express-5-111827?style=flat-square">
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-Database-3ecf8e?style=flat-square">
  <img alt="Accessibility" src="https://img.shields.io/badge/Accessibilite-prioritaire-2563eb?style=flat-square">
</p>

## Vue D'ensemble

Meditrack accompagne les utilisateurs dans les différentes étapes avant, pendant et après une intervention chirurgicale. Le projet met l'accent sur une interface lisible, des interactions accessibles et une organisation simple des informations importantes.

L'application est structurée en deux parties:

- `frontend`: interface Vue.js avec Vite.
- `backend`: API Node.js avec Express.
- `Supabase`: base de données, stockage et services associés.

<p align="center">
  <img src="docs/assets/meditrack-flow.svg" alt="Parcours fonctionnel Meditrack" width="900">
</p>

## Fonctionnalités

| Module        | Description                                                                                                |
| ------------- | ---------------------------------------------------------------------------------------------------------- |
| Accueil       | Vue synthétique du prochain rendez-vous, des tâches du jour et des documents récents.                      |
| Étapes        | Suivi des grandes phases du parcours chirurgical avec progression étape par étape.                         |
| Rendez-vous   | Consultation, historique et ajout de rendez-vous médicaux.                                                 |
| Documents     | Gestion des documents utiles au parcours: comptes rendus, ordonnances, bilans et documents administratifs. |
| Accessibilité | Navigation par onglets, libellés ARIA, focus clavier et structure pensée pour la lecture assistée.         |

## Stack Technique

| Couche         | Technologie             |
| -------------- | ----------------------- |
| Frontend       | Vue 3, Vite             |
| Backend        | Node.js, Express        |
| Données        | Supabase                |
| Qualité        | ESLint                  |
| Gestion projet | Scripts npm à la racine |

## Structure

```text
Meditrack/
├── backend/              # API Express
│   ├── api/              # Routes / handlers API
│   ├── server.js         # Point d'entrée backend
│   └── package.json
├── frontend/             # Application Vue/Vite
│   ├── src/
│   │   ├── components/   # Modules UI
│   │   ├── layout/       # Navigation
│   │   └── lib/          # Client Supabase
│   └── package.json
├── docs/assets/          # Illustrations du README
├── Makefile              # Commandes de dev, qualité et redémarrage
├── scripts/dev.sh        # Lancement backend + frontend
└── package.json          # Scripts globaux
```

## Prérequis

- Node.js `^20.19.0` ou `>=22.12.0`
- npm
- Un projet Supabase configuré

## Variables D'environnement

Des fichiers `.env_exemple` sont disponibles dans `backend` et `frontend`.

`backend/.env`

```env
SUPABASE_URL=https://xyz.supabase.co
SUPABASE_SERVICE_ROLE=your_service_role_key
```

`frontend/.env`

```env
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=https://xyz.supabase.co
VITE_SUPABASE_ANON=your_anon_key
```

Les fichiers `.env` ne doivent pas être commit. Ils sont ignorés par Git.

## Installation

Depuis la racine du projet:

```bash
npm run setup
```

Cette commande installe les dépendances du backend et du frontend.

## Démarrage

Pour mettre à jour les dépendances puis lancer le backend et le frontend:

```bash
make start
```

Pour arrêter les services actifs sur les ports du projet puis les relancer:

```bash
make restart
```

Pour installer les dépendances puis lancer le projet en une seule commande:

```bash
npm run setup:start
```

Pour lancer le projet quand les dépendances sont déjà installées:

```bash
npm start
```

Le backend démarre sur:

```text
http://localhost:3000
```

Le frontend démarre sur l'URL indiquée par Vite, généralement:

```text
http://localhost:5173
```

Si le port `5173` est déjà utilisé, Vite choisit automatiquement le port suivant disponible.

## Commandes Utiles

| Commande                 | Rôle                                                               |
| ------------------------ | ------------------------------------------------------------------ |
| `make start`             | Met à jour les dépendances puis lance backend et frontend.         |
| `make restart`           | Arrête les ports `3000` et `5173`, puis relance le projet.         |
| `make quality`           | Formate le code, applique ESLint, puis vérifie ESLint et Prettier. |
| `make precommit`         | Alias de `make quality`, à lancer avant de commit.                 |
| `npm run setup`          | Installe les dépendances backend et frontend.                      |
| `npm run setup:start`    | Installe les dépendances puis démarre le projet.                   |
| `npm start`              | Lance backend et frontend ensemble.                                |
| `npm run start:backend`  | Lance uniquement l'API Express.                                    |
| `npm run start:frontend` | Lance uniquement l'application Vue/Vite.                           |
| `npm run format`         | Applique Prettier sur les fichiers pris en charge.                 |
| `npm run check-format`   | Vérifie le formatage Prettier sans modifier les fichiers.          |
| `npm run lint`           | Exécute ESLint sur le projet.                                      |
| `npm run lint:fix`       | Applique automatiquement les corrections ESLint disponibles.       |

Avant un commit, la commande recommandée est:

```bash
make precommit
```

## Développement

Le backend peut être lancé seul depuis `backend`:

```bash
npm install
npm start
```

Le frontend peut être lancé seul depuis `frontend`:

```bash
npm install
npm run dev
```

## Notes

- Le backend utilise `backend/server.js` comme point d'entrée.
- Le frontend lit les variables commençant par `VITE_`.
- Le projet est organisé pour garder une séparation claire entre interface, API et services Supabase.
