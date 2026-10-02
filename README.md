# 🚀 MarsAI — Plateforme & Monorepo

> **MarsAI** est une plateforme web complète dédiée au festival international du film d'IA, orchestrant la diffusion des œuvres en compétition, l'espace d'évaluation du jury, la gestion des événements et la billetterie. Déployée sous Docker (React, API Node.js / Express, MariaDB), la stack intègre les meilleures pratiques de sécurité et d'optimisation des performances.

Ce dépôt centralise l'intégralité du projet MarsAI sous forme de **monorepo** : interface utilisateur frontend, API backend sécurisée, base de données MariaDB et orchestration Docker pour la production.

---

## 📑 Sommaire
1. [Architecture de la stack](#-architecture-de-la-stack)
2. [Prérequis](#-prérequis)
3. [Structure du Monorepo](#-structure-du-monorepo)
4. [Tutoriel d'installation pas-à-pas](#-tutoriel-dinstallation-pas-à-pas)
   - [Étape 1 : Cloner le Monorepo](#étape-1--cloner-le-monorepo)
   - [Étape 2 : Créer le réseau Docker externe](#étape-2--créer-le-réseau-docker-externe)
   - [Étape 3 : Configurer les variables d'environnement (`.env`)](#étape-3--configurer-les-variables-denvironnement-env)
   - [Étape 4 : Préparer le dossier d'uploads](#étape-4--préparer-le-dossier-duploads)
   - [Étape 5 : Démarrer la stack](#étape-5--démarrer-la-stack)
   - [Étape 6 : Créer le premier compte administrateur](#étape-6--créer-le-premier-compte-administrateur)
5. [Accès et Reverse Proxy](#-accès-et-reverse-proxy)
6. [Sécurité & Durcissement](#-sécurité--durcissement)
7. [Commandes utiles au quotidien](#-commandes-utiles-au-quotidien)
8. [Dépannage courant](#-dépannage-courant)

---

## 🏗️ Architecture de la stack

La stack de production est orchestrée via **Docker Compose** et connectée à un réseau externe (`nas-net`) pour une intégration transparente avec votre Reverse Proxy (Nginx Proxy Manager, Traefik, Caddy, etc.) :

```
                           [ Internet / Utilisateurs ]
                                        │
                                        ▼
                      [ Reverse Proxy (NPM / Traefik) ]
                            (sur le réseau 'nas-net')
                                    │         │
                   ┌────────────────┘         └────────────────┐
                   │ :8080 (interne :80)                       │ :3000
                   ▼                                           ▼
          ┌─────────────────┐                         ┌─────────────────┐
          │ marsai-frontend │                         │ marsai-backend  │
          │ (React + Nginx) │                         │ (Node.js API)   │
          └─────────────────┘                         └────────┬────────┘
                                                               │
                                               ┌───────────────┴───────────────┐
                                               ▼                               ▼
                                      ┌─────────────────┐             ┌─────────────────┐
                                      │    marsai-db    │             │ ./marsai-uploads│
                                      │ (MariaDB 10.11) │             │ (Volume partagé)│
                                      └─────────────────┘             └─────────────────┘
```

| Service | Rôle | Port hôte / interne | Description |
| :--- | :--- | :--- | :--- |
| **`marsai-frontend`** | Interface utilisateur | `8080:80` | Application React 19 / Vite / Tailwind compilée en multi-stage build et servie par un conteneur Nginx optimisé. |
| **`marsai-backend`** | API & Logique métier | `3000:3000` | API REST Node.js 22 / Express 5 (TypeScript compilé), exécutée sous utilisateur non-root `node`, avec contrôle d'accès RBAC et limitation de débit. |
| **`marsai-db`** | Base de données | `3306` (interne) | MariaDB 10.11 avec initialisation automatique du schéma SQL (`./marsai-backend/database/db.sql`) et sondes d'état de santé (`healthcheck`). |
| **Volume `./marsai-uploads`** | Stockage médias | - | Répertoire hôte persistant pour les affiches et vidéos soumises, monté dans `/app/uploads`. |

---

## 📋 Prérequis

* **Docker Engine** (version 24.0 ou supérieure) et **Docker Compose v2** (`docker compose version`).
* **Git**.
* Un **Reverse Proxy** (ex. Nginx Proxy Manager, Traefik, Caddy) configuré sur un réseau Docker partagé (par défaut `nas-net`).

---

## 📁 Structure du Monorepo

```text
Marsai/
├── docker-compose.yml         # Fichier principal d'orchestration Docker Compose
├── .env.example               # Modèle des variables d'environnement
├── .env                       # Variables d'environnement de production (ignoré par Git)
├── marsai-uploads/            # Dossier local monté pour le stockage des vidéos et images
│   ├── images/                # Vignettes et affiches téléversées
│   └── videos/                # Fichiers vidéo des films en compétition
├── marsai-frontend/           # [Frontend] Application React 19, TypeScript, Vite & Tailwind
│   ├── src/                   # Code source React (pages, composants, contextes)
│   ├── nginx.conf             # Configuration Nginx de production (SPA fallback, headers)
│   └── Dockerfile             # Multi-stage build (Vite -> Nginx Alpine)
├── marsai-backend/            # [Backend] API REST Express 5, TypeScript & MariaDB
│   ├── config/                # Configurations (BDD, Multer sécurisé, etc.)
│   ├── controllers/           # Contrôleurs métier avec gestion d'erreurs sécurisée
│   ├── database/db.sql        # Schéma et données initiales SQL
│   ├── middlewares/           # Authentification JWT, RBAC, Rate Limiting, upload
│   ├── routes/                # Définitions des routes API REST
│   ├── scripts/create-admin.ts# Script CLI de création/mise à jour du compte administrateur
│   └── Dockerfile             # Multi-stage build (tsc -> Node.js 22 Alpine non-root)
├── marsai-clamav-watchdog/    # [Optionnel / Standalone] Watchdog antivirus ClamAV
└── TODO.md                    # Feuille de route technique et état d'avancement sécurité
```

---

## 🚀 Tutoriel d'installation pas-à-pas

### Étape 1 : Cloner le Monorepo

Clonez le dépôt sur votre serveur ou machine hôte :

```bash
git clone git@github.com:paguera/Marsai.git
cd Marsai
```

---

### Étape 2 : Créer le réseau Docker externe

La configuration `docker-compose.yml` utilise un réseau bridge externe nommé `nas-net` pour faciliter la communication avec votre Reverse Proxy.

Créez ce réseau s'il n'existe pas déjà :

```bash
docker network create nas-net
```

> [!NOTE]
> Si vous souhaitez utiliser un nom de réseau différent ou un réseau interne créé par Docker Compose, vous pouvez adapter la section `networks` du fichier [docker-compose.yml](file:///home/gabriel/dev/Marsai/docker-compose.yml).

---

### Étape 3 : Configurer les variables d'environnement (`.env`)

Copiez le modèle de configuration fourni puis adaptez les valeurs avec vos paramètres réels :

```bash
cp .env.example .env
nano .env
```

Exemple de configuration type :

```dotenv
# ==============================================================================
# Configuration Générale & URLs
# ==============================================================================
PORT=3000
BASE_URL=https://api.marsai.example.com
FRONT_URL=https://marsai.example.com

# ==============================================================================
# Base de données MariaDB (marsai-db)
# ==============================================================================
MARSAI_DB_ROOT_PASSWORD=votre_mot_de_passe_root_ultra_securise
MARSAI_DB_NAME=marsai
MARSAI_DB_USER=marsai_user
MARSAI_DB_PASSWORD=votre_mot_de_passe_utilisateur_securise

# ==============================================================================
# Authentification & JWT
# ==============================================================================
JWT_SECRET=generer_une_longue_chaine_aleatoire_cryptographique_ici

# ==============================================================================
# Configuration Messagerie SMTP (Nodemailer)
# ==============================================================================
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USER=postmaster@votre-domaine.com
MAIL_PASS=votre_mot_de_passe_smtp
MAIL_SECURE=false
MAIL_TO=contact@votre-domaine.com
```

---

### Étape 4 : Préparer le dossier d'uploads

Le dossier `./marsai-uploads` héberge les images et les vidéos des films soumis. Créez la structure requise et définissez les permissions adéquates pour le conteneur :

```bash
mkdir -p marsai-uploads/images marsai-uploads/videos
chmod -R 775 marsai-uploads
```

---

### Étape 5 : Démarrer la stack

Lancez la compilation multi-stage des conteneurs et le démarrage de tous les services en arrière-plan :

```bash
docker compose up -d --build
```

#### Vérifier l'état d'exécution :
```bash
docker compose ps
```
Tous les conteneurs (`marsai-db`, `marsai-backend`, `marsai-frontend`) doivent afficher le statut `Up` (avec `healthy` pour la base de données).

#### Suivre les journaux (logs) :
```bash
docker compose logs -f
```

---

### Étape 6 : Créer le premier compte administrateur

Le backend intègre un script dédié permettant d'initialiser ou de promouvoir un compte avec le rôle `ADMIN` :

```bash
# Mode interactif (saisie guidée de l'email, mot de passe, prénom, nom)
docker compose exec marsai-backend npm run create-admin
```

Vous pouvez également passer les arguments en ligne de commande :
```bash
docker compose exec marsai-backend node dist/scripts/create-admin.js admin@marsai.fr "MotDePasseFort123!" John Doe
```

---

## 🌐 Accès et Reverse Proxy

Une fois la stack démarrée, configurez votre Reverse Proxy (Nginx Proxy Manager, Traefik, Caddy, etc.) connecté au réseau Docker `nas-net` :

### Configuration Frontend
* **Domaine :** `marsai.example.com`
* **Forward Hostname / IP :** `marsai-frontend` (ou IP de l'hôte)
* **Forward Port :** `80` (si routage direct sur `nas-net`) ou `8080` (si routage via le port hôte)
* **SSL :** Activer le certificat SSL/TLS (Let's Encrypt / HSTS / HTTP/2)

### Configuration Backend API
* **Domaine :** `api.marsai.example.com`
* **Forward Hostname / IP :** `marsai-backend` (ou IP de l'hôte)
* **Forward Port :** `3000`
* **SSL :** Activer le certificat SSL/TLS
* **Taille d'upload :** Augmenter la limite `client_max_body_size` (ex. `500M` pour autoriser le téléversement de vidéos).

---

## 🛡️ Sécurité & Durcissement

La plateforme applique des règles strictes de sécurité et de résilience :

1. **Protection des routes et Contrôle d'Accès (RBAC) :**
   - La soumission de films (`POST /movies`), la gestion des événements et la création de comptes sont strictement réservées aux utilisateurs authentifiés (`ADMIN` ou `JURY`).
   - L'authentification est vérifiée *en amont* du traitement des fichiers téléversés pour prévenir tout abus de stockage.
2. **Rate Limiting (Anti-Brute Force & Anti-DoS) :**
   - Limitation granulaire via `express-rate-limit` sur l'authentification (`/auth/login`), la réservation d'événements, la newsletter et les téléversements.
3. **Sécurité des Fichiers & Téléversements :**
   - Renommage cryptographique aléatoire des fichiers (`crypto.randomBytes`) évitant les attaques par *Path Traversal*.
   - Double vérification du type MIME et de l'extension de fichier.
   - Mécanisme d'annulation et nettoyage automatique (*upload rollback*) des fichiers temporaires en cas d'échec de validation ou d'insertion en BDD.
4. **En-têtes HTTP & Confidentialité :**
   - Protection par `helmet` avec politiques cross-origin adaptées.
   - Suppression des en-têtes révélateurs (`x-powered-by`).
   - Masquage des erreurs BDD internes vers le client pour éviter les fuites d'informations.
   - Filtrage strict des données personnelles des collaborateurs selon le rôle (RGPD).
5. **Durcissement des Conteneurs Docker :**
   - Multi-stage builds allégés basés sur Alpine Linux.
   - Exécution du backend sous l'utilisateur non privilégié `node`.
   - Option `no-new-privileges:true` et quotas CPU/mémoire configurés dans `docker-compose.yml`.

---

## 🛠️ Commandes utiles au quotidien

| Action | Commande |
| :--- | :--- |
| **Démarrer les services** | `docker compose up -d` |
| **Arrêter les services** | `docker compose down` |
| **Reconstruire et relancer** | `docker compose up -d --build` |
| **Suivre les logs en temps réel** | `docker compose logs -f` |
| **Logs du backend uniquement** | `docker compose logs -f marsai-backend` |
| **Logs du frontend uniquement** | `docker compose logs -f marsai-frontend` |
| **Vérifier l'état de la base de données** | `docker compose ps marsai-db` |
| **Ouvrir un shell dans le conteneur API** | `docker compose exec marsai-backend sh` |
| **Créer ou mettre à jour un administrateur** | `docker compose exec marsai-backend npm run create-admin` |
| **Sauvegarder la base de données** | `docker compose exec marsai-db mysqldump -u marsai_user -p marsai > backup.sql` |

---

## 🔧 Dépannage courant

### 1. Erreur de réseau `network nas-net not found`
Si Docker Compose indique que le réseau externe n'existe pas :
```bash
docker network create nas-net
```

### 2. Problème d'écriture dans `marsai-uploads`
Si le backend renvoie une erreur de permission lors du téléversement d'images ou de vidéos :
```bash
chmod -R 775 marsai-uploads
```

### 3. Le conteneur backend attend la base de données
Le service `marsai-backend` attend que `marsai-db` soit en état `healthy` avant de démarrer. Si MariaDB met du temps à s'initialiser au tout premier lancement, observez son état avec :
```bash
docker compose logs -f marsai-db
```

### 4. Erreurs CORS sur le frontend
Vérifiez que la variable `FRONT_URL` dans votre fichier `.env` correspond exactement à l'URL publique utilisée dans le navigateur (ex: `https://marsai.example.com` sans slash final), et que `VITE_API_URL` / `BASE_URL` pointe bien vers l'adresse publique du backend.
