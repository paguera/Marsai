# 📋 Feuille de Route & Audit de Sécurité (TODO)

Ce document récapitule l'ensemble des vulnérabilités identifiées lors de l'audit de sécurité approfondi ainsi que l'état d'avancement des chantiers techniques de durcissement et d'allègement de la plateforme **MarsAI**.

---

## 🎯 0. Décision d'Architecture : Allègement du Serveur de Production
- [x] **Protection de la soumission de films (`POST /movies` et route `/submit`) :**
  - Restreinte exclusivement aux rôles `ADMIN` et `JURY`.
  - Contrôle d'authentification et d'autorisation appliqué *avant* le middleware de téléversement `multer`.
- [x] **Désactivation de ClamAV Watchdog :**
  - Suppression/Désactivation du conteneur lourd ClamAV (`marsai-watchdog`) dans `docker-compose.yml` pour libérer ~1 Go de RAM et de la charge CPU sur le serveur/NAS.

---

## 🔴 Priorité P0 : Failles Critiques & Risques Immédiats

- [x] **1. Rate Limiting & Protection Anti-Brute Force / Anti-DoS :**
  - **Résolu :** `express-rate-limit` installé et configuré avec des règles granulaires :
    - `authLimiter` (10 tentatives / 15 min) sur `/auth/login`.
    - `emailActionLimiter` (15 requêtes / 15 min) sur `/events/book` et `/subscribers/subscribe`.
    - `uploadLimiter` (20 soumissions / 15 min) sur `/movies`.
    - `globalLimiter` (500 requêtes / 15 min) sur l'ensemble de l'API Express.

- [x] **2. Masquage des erreurs internes de Base de Données (Information Disclosure) :**
  - **Résolu :** Suppression des fuites `error.message` / `Database error` dans l'ensemble des contrôleurs (`movies`, `events`, `auth`, `admin`, `tags`, `jury`, `newsletters`, `subscribers`).
  - Remplacement par des réponses JSON sécurisées et standardisées (`{ error: "Une erreur interne est survenue." }`) avec journalisation serveur détaillée.
  - Ajout d'un middleware d'erreur centralisé dans `server.ts`.

- [x] **3. Protection contre l'Injection HTML dans les E-mails Transactionnels :**
  - **Résolu :** Création d'un utilitaire `escapeHtml` (`utils/sanitize.ts`). Échappement systématique des entrées utilisateurs (`firstname`, `lastname`, `title`, `location`) dans les templates de confirmation de réservation et d'annulation.

---

## 🟠 Priorité P1 : Sécurité HTTP, Sessions & En-têtes

- [x] **4. En-têtes de Sécurité HTTP (`helmet`) & Restriction CORS :**
  - **Résolu :**
    - `helmet` intégré sur Express avec politique de ressources cross-origin sécurisée.
    - Désactivation de l'en-tête de signature `x-powered-by`.
    - CORS conditionné à l'environnement : liste blanche stricte en production, déblocage des IPs locales réservé au développement.

- [x] **5. Expiration des Jetons JWT d'Annulation & Désinscription :**
  - **Résolu :**
    - Token d'annulation d'événement (`unbookingToken`) limité à une validité de 7 jours.
    - Token de désinscription newsletter (`unsubscribeToken`) limité à 30 jours.
    - Token d'authentification utilisateur (`login`) limité à 8h.

- [ ] **6. Migration de l'Authentification vers des Cookies `httpOnly` :**
  - [ ] Installer et configurer `cookie-parser` dans Express.
  - [ ] Stocker le token de session dans un cookie `httpOnly`, `secure`, `sameSite: 'lax'`.
  - [ ] Adapter `AuthContext.tsx` et les requêtes `fetch` (`credentials: 'include'`).

---

## 🟡 Priorité P2 : Durcissement des Fichiers & Données Personnelles (RGPD)

- [x] **7. Durcissement des Téléversements & Génération de Noms Sécurisés :**
  - **Résolu :** `config/multer.ts` génère désormais des noms aléatoires cryptographiques (`crypto.randomBytes`) pour bannir tout risque de *Path Traversal*.
  - Double vérification : validation de l'extension ET du `mimetype` vidéo/image.

- [x] **8. Nettoyage Automatique des Fichiers Orphelins (Upload Rollback) :**
  - **Résolu :** Implémentation du helper `cleanupFiles` dans `movies.controller.ts` pour supprimer immédiatement les fichiers temporaires du disque si la validation échoue, si le film est en doublon ou si l'insertion BDD échoue.

- [x] **9. Filtrage RGPD des Données Collaborateurs (`GET /movies/:id/collaborators`) :**
  - **Résolu :** La requête publique ne retourne plus que les champs non sensibles (`id`, `movie_id`, `firstname`, `lastname`, `contribution`, `gender`). L'exposition complète (email, téléphone, date de naissance, ville) est restreinte aux administrateurs authentifiés.

---

## 🟢 Priorité P3 : DevOps, Docker Hardening & Qualité de Code

- [x] **10. Durcissement des Conteneurs Docker & Compose :**
  - **Résolu :**
    - `marsai-backend/Dockerfile` refondu en **Multi-stage build** basé sur `node:22-alpine` avec compilation JavaScript pure (`dist/server.js`) au lieu de `ts-node`.
    - Exécution du processus sous l'utilisateur non-privilégié `USER node`.
    - Suppression de `npm audit fix --force` des Dockerfiles.
    - Ajout de `no-new-privileges:true` et de quotas de ressources CPU / RAM sur le backend et le frontend dans `docker-compose.yml`.

- [x] **11. Nettoyage de Code & Qualité :**
  - **Résolu :**
    - Suppression de la route orpheline en doublon `router.delete("/event/:id")` dans `marsai-backend/routes/admin.routes.ts`.
    - Suppression du doublon `eslint.config.js` (unifié sur `eslint.config.mjs`).
    - Correction de la signature de `getPendingMoviesByTag` dans `movies.controller.ts`.
