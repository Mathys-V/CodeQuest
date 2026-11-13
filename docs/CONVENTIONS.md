# Conventions de Travail en Binôme

## 1. Stratégie de Branches
- `main` : Branche de production/démonstration. Protégée contre les push directs.
- `feat/<périmètre>-<titre>` : Nouvelle fonctionnalité (ex: `feat/runner-docker-exec`, `feat/auth-jwt-argon2`).
- `fix/<périmètre>-<titre>` : Correction de bug.
- `chore/<titre>` : Maintenance, mise à jour de dépendances ou de CI.

## 2. Conventional Commits
Chaque commit doit respecter la norme :
- `feat:` nouvelle fonctionnalité
- `fix:` correction de bogue
- `test:` ajout ou modification de tests
- `docs:` documentation
- `refactor:` modification de code sans impact fonctionnel
- `ci:` ajustement du pipeline d'intégration continue

Exemple : `feat(runner): add cgroup memory limitation to isolated execution`

## 3. Pull Requests
- Relecture obligatoire par le binôme avant tout merge sur `main`.
- La CI doit être verte.
- Pas de merge direct en ligne de commande sur `main`.
