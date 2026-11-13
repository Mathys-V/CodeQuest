# Architecture Globale - CodeQuest

## 1. Vue d'ensemble

- **Frontend (`apps/web`)** : React + TypeScript + Vite + Tailwind CSS + Monaco Editor
- **Backend (`apps/api`)** : Node.js + NestJS + PostgreSQL 16 + Redis 7
- **Moteur d'exécution (`services/runner`)** : Conteneurs éphémères isolés sans réseau (évaluation Python / JS)
- **Générateur d'assets (`services/assets`)** : Python FastAPI (Pillow, QR Code, Stéganographie)
- **Stockage Objets** : MinIO (compatible S3) pour avatars et images de défis
- **Serveur de Mail dev** : MailHog pour intercepter les e-mails d'inscription et de réinitialisation

## 2. Modèle de Données & Intégrité
- Authentification avec Argon2id et sessions par cookies HttpOnly (Access JWT + Refresh token tournant).
- RBAC : Visiteur, Joueur, Capitaine, Modérateur, Administrateur.
- Registre immuable (Ledger) pour la monnaie virtuelle (Bits).
