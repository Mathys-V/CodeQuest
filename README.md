# 🚀 CodeQuest

> **Plateforme d'apprentissage et de défis informatiques**  
> BUT 3 Informatique — Semestre 5 — R5.05 Programmation Avancée

---

## 📖 À propos du projet

CodeQuest est une plateforme web d'apprentissage et de compétition où des développeurs (les *Runners*) s'affrontent seuls ou en équipe pour reprendre le contrôle du Réseau mondial face à une IA corrompue (**ORACLE**).

Chaque notion algorithmique ou de cybersécurité fait l'objet d'un **cours/didacticiel**, suivi d'un **défi pratique** évalué en temps réel dans un bac à sable isolé.

### 🌟 Fonctionnalités clés
- **Défis Algorithmiques & Tris** : Bubble sort, merge sort, quicksort, tris personnalisés, évaluation en conteneur éphémère et scoring basé sur le temps CPU.
- **Débogage & Décryptage** : Recherche et correction d'erreurs, chiffrements classiques (César, Vigenère, XOR) avec seeds uniques anti-triche.
- **Stéganographie & QR Codes** : Analyse LSB, métadonnées cachées, reconstruction de QR codes altérés.
- **Gamification & Social** : Équipes, combats de Boss par phases, points de vie (PV), économie virtuelle (Bits) et classement quasi-temps réel (Redis).

---

## 🏗️ Architecture du Monorepo

```text
CodeQuest/
├── apps/
│   ├── api/             # Backend API (Node.js, NestJS, TypeScript, Swagger)
│   └── web/             # Frontend Client (React, TypeScript, Vite, Tailwind CSS, Monaco Editor)
├── services/
│   ├── runner/          # Moteur d'exécution de code sécurisé & conteneurisé (bac à sable)
│   └── assets/          # Service Python de génération d'images stéganographiques et QR codes
├── infra/               # Configurations d'infrastructure, reverse proxy et déploiement
├── docs/                # Architecture, schémas de base de données, conventions
├── .github/             # Workflows CI/CD (GitHub Actions) et templates de Pull Request
├── docker-compose.yml   # Orchestration locale de l'ensemble de la pile
└── .env.example         # Gabarit des variables d'environnement
```

---

## 👥 Répartition de l'équipe (Binôme)

| Développeur | Domaine de responsabilité | Composants clés |
| :--- | :--- | :--- |
| **Mathys** (Dev 1) | **Lead Socle, Infra & Moteur d'exécution** | Setup Git & Docker Compose, Bac à sable (`services/runner`), Moteur de scoring, Endpoints défis & classements Redis, Intégration Monaco Editor. |
| **Binôme** (Dev 2) | **Lead UI/UX, Sécurité applicative & Gamification** | Design system néon & layouts, Module d'authentification complète (Argon2id, JWT/cookies HttpOnly, RBAC), Économie & PV/Boss, Service assets Python (`services/assets`). |

---

## ⚡ Démarrage Rapide (Développement)

### 1. Prérequis
- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js](https://nodejs.org/) v20+ ou v22+
- [Git](https://git-scm.com/)

### 2. Cloner et configurer l'environnement
```bash
git clone https://github.com/Mathys-V/CodeQuest.git
cd CodeQuest

# Créer votre fichier d'environnement local
cp .env.example .env
```

### 3. Lancer l'infrastructure avec Docker Compose
```bash
docker-compose up -d
```

### 4. Accès aux services locaux
- **Application Web** : [http://localhost:3000](http://localhost:3000)
- **API REST & Swagger** : [http://localhost:4000/api/v1](http://localhost:4000/api/v1)
- **Boîte mail de test (MailHog)** : [http://localhost:8025](http://localhost:8025)
- **Console MinIO (S3)** : [http://localhost:9001](http://localhost:9001)

---

## 🛡️ Stratégie Git & Règles de Collaboration

1. **Branche principale `main` protégée** :
   - Aucun push direct autorisé sur `main`.
   - Tout passage par une Pull Request avec **relecture obligatoire du binôme** et **CI verte**.
2. **Nommage des branches** :
   - `feat/<domaine>-<titre>` (ex: `feat/runner-docker-sandbox`)
   - `fix/<domaine>-<titre>`
3. **Format des commits (Conventional Commits)** :
   - `feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`
