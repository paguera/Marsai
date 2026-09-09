# 📋 Feuille de route technique & Sécurité (TODO)

Ce document récapitule les chantiers techniques prioritaires pour consolider, sécuriser et fiabiliser la plateforme **MarsAI**.

---

## 1. 🛡️ Validation des Fichiers & Type MIME (Backend)

- [ ] **Détection réelle du type MIME (Magic Numbers) :**
  - Actuellement dans `marsai-backend/config/multer.ts`, le filtrage repose uniquement sur l'extension du nom (`path.extname(file.originalname)`).
  - Intégrer une vérification binaire réelle (via la librairie `file-type`) sur le flux ou le buffer pour s'assurer qu'un exécutable ou script malveillant renommé (ex. `payload.php.mp4`) ne soit pas accepté.
  - Vérifier également le champ `file.mimetype` transmis par le client.
- [ ] **Nettoyage automatique des fichiers orphelins (Rollback Uploads) :**
  - Multer écrit les fichiers (jusqu'à 500 Mo par vidéo) sur le disque *avant* la validation des champs texte (`validateSubmitMovieForm`), la détection de doublons ou la transaction SQL.
  - Mettre en place un mécanisme de nettoyage (`fs.unlink`) pour purger immédiatement les fichiers téléversés si la validation échoue ou si une erreur survient lors de l'insertion en BDD.

---

## 2. 🔐 Authentification & Sécurité des Sessions (Cookies HttpOnly)

- [ ] **Migration du stockage JWT vers les cookies `httpOnly` :**
  - Remplacer le stockage actuel du token dans le `localStorage` du navigateur (vulnérable aux attaques XSS) par des cookies sécurisés : `httpOnly: true`, `secure: true` (en production), `sameSite: 'lax'` (ou `'strict'`).
- [ ] **Configuration Backend (Express) :**
  - Installer et brancher `cookie-parser`.
  - Adapter le contrôleur d'authentification (`marsai-backend/controllers/auth.controller.ts`) pour injecter le cookie lors du `login`.
  - Adapter le middleware `marsai-backend/middlewares/authenticateToken.ts` pour lire le token depuis `req.cookies.token` (avec repli sur l'en-tête `Authorization: Bearer` pour la compatibilité API/scripts).
  - Créer un endpoint `POST /auth/logout` pour révoquer le cookie côté serveur (`res.clearCookie`).
- [ ] **Configuration Frontend (React / Vite) :**
  - Mettre à jour les appels `fetch` / `axios` pour inclure les cookies de session (`credentials: 'include'`).
  - Mettre à jour `AuthContext.tsx` pour hydrater l'utilisateur au chargement via l'appel `/auth/me` sans dépendre de `localStorage`.
- [ ] **Protection CSRF :**
  - Mettre en place une protection contre les requêtes inter-sites forgées (CSRF) pour les opérations de modification d'état.

---

## 3. ⚖️ Protection des Données Personnelles (RGPD)

- [ ] **Filtrage des données sur `GET /movies/:id/collaborators` :**
  - Cette route est actuellement publique et retourne l'intégralité de la table `collaborator` (`SELECT *`).
  - Elle expose en clair les adresses email, numéros de téléphone, dates de naissance et villes des réalisateurs et membres de l'équipe.
  - Filtrer la réponse publique pour ne renvoyer que les informations publiques (`firstname`, `lastname`, `contribution`) et réserver l'accès aux données personnelles aux administrateurs (`ADMIN`).

---

## 4. 🧱 Sécurité Globale de l'API & Gestion des Erreurs

- [ ] **En-têtes de sécurité HTTP :**
  - Installer et intégrer le middleware `helmet` dans `server.ts` (protection XSS, Content-Security-Policy, HSTS, X-Content-Type-Options).
- [ ] **Limitation de débit (Rate Limiting) :**
  - Installer `express-rate-limit` pour protéger les routes sensibles contre les attaques par force brute (notamment `POST /auth/login` et la soumission de films `POST /movies`).
- [ ] **Middleware global de gestion des erreurs :**
  - Définir un middleware d'erreur centralisé (`app.use((err, req, res, next) => ...)`) dans Express.
  - Éviter d'exposer les messages d'erreurs SQL internes aux clients (`Database error: ...`).
  - Standardiser le format JSON des erreurs renvoyées.

---

## 5. 🦠 Synchronisation Antivirus (Watchdog ClamAV) & BDD

- [ ] **Synchronisation avec la base de données :**
  - Le watchdog supprime actuellement le fichier infecté avec `rm -f "$FILE"`, mais la BDD conserve la référence au média.
  - Ajouter un mécanisme (script/webhook/requête SQL) permettant de basculer automatiquement le film infecté en statut `Rejected` ou `Infected` et d'alerter les administrateurs.
- [ ] **Zone de quarantaine (Staging) :**
  - Téléverser temporairement les médias dans un répertoire de quarantaine non accessible publiquement, puis les déplacer dans `uploads/` uniquement après validation par ClamAV.

---

## 6. 🐳 DevOps, Docker & Déploiement

- [ ] **Optimisation du Dockerfile Backend pour la production :**
  - Épingler une version Node.js LTS légère (`node:22-bookworm-slim` ou `node:22-alpine`) au lieu de `node:latest`.
  - Remplacer `ts-node server.ts` en production par un build compilé (`tsc`) exécuté avec `node dist/server.js`.
  - Retirer `npm audit fix --force` du processus de build pour éviter des ruptures imprévues de dépendances.
  - Exécuter le conteneur avec l'utilisateur non-privilégié `USER node`.

---

## 7. 🧹 Qualité de Code & Maintenance

- [x] **Correction de syntaxe de middleware sur `/auth/register` :**
  - Dans `marsai-backend/routes/auth.routes.ts`, passer `authenticateToken` au lieu de l'appel `authenticateToken()` (ce middleware attend directement `(req, res, next)` et non une factory).
- [ ] **Suppression de route orpheline en doublon :**
  - Dans `marsai-backend/routes/admin.routes.ts`, supprimer la seconde déclaration de `router.delete("/event/:id")`.
- [ ] **Unification de la configuration ESLint :**
  - Supprimer le doublon entre `eslint.config.js` et `eslint.config.mjs` dans le backend.
  - Ajouter le script `"lint": "eslint ."` dans `marsai-backend/package.json`.
- [ ] **Tests automatisés :**
  - Créer les premiers tests d'intégration backend (avec `vitest` et `supertest`) pour valider les routes d'authentification et de soumission de films.
  - Mettre en place des tests de composants clés sur le frontend.
