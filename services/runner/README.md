# Service Runner (Bac à Sable d'Exécution)

Ce service est chargé d'exécuter le code utilisateur soumis (Python, JavaScript, etc.) dans un environnement isolé et sécurisé.

## Contraintes de sécurité
- Conteneurs éphémères détruits après chaque run
- Aucun accès réseau (`--network none`)
- Système de fichiers en lecture seule (sauf `/tmp` avec quota)
- Limites strictes cgroups : CPU, mémoire (128 Mo max), PIDs (max 32 pour éviter les fork bombs)
- Mesure précise du temps CPU (médiane sur 5 exécutions)
