FROM alpine:3.20

# Installer les runtimes d'exécution pour les défis (Python, Node.js)
RUN apk add --no-cache python3 nodejs libcap util-linux

# Utilisateur non-root obligatoire
RUN adduser -D -u 2000 runneruser
USER runneruser
WORKDIR /home/runneruser

CMD ["sh"]
