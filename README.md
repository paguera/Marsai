# 🚀 MarsAI — Plateforme & Monorepo

> **MarsAI** est une plateforme complète dédiée au festival du film d'IA, orchestrant la diffusion des œuvres, l'espace jury et les événements. Déployée sous Docker (React, API Node.js, MariaDB), la stack intègre un antivirus ClamAV en temps réel analysant chaque média téléversé pour garantir une expérience à la fois fluide et ultra-sécurisée.

Ce dépôt centralise l'intégralité du projet MarsAI sous forme de **monorepo** : l'interface utilisateur frontend, l'API backend, la base de données, la sécurité antivirus en temps réel et l'orchestration Docker.

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
6. [Fonctionnement de l'Antivirus (Watchdog ClamAV)](#-fonctionnement-de-lantivirus-watchdog-clamav)
7. [Commandes utiles au quotidien](#-commandes-utiles-au-quotidien)
8. [Dépannage courant](#-dépannage-courant)

---

## 🏗️ Architecture de la stack

La stack est composée de 4 services orchestrés via Docker Compose :

```
                           [ Internet / Réseau Local ]
                                        │
                                        ▼
                           [ Reverse Proxy (ex: NPM / Traefik) ]
                                 (sur 'nas-net')
                                   │         │
                   ┌───────────────┘         └──────────────┐
                   │ :80                                    │ :3000
                   ▼                                        ▼
          ┌─────────────────┐                      ┌─────────────────┐
          │ marsai-frontend │                      │ marsai-backend  │
          │ (React + Nginx) │                      │ (Node.js API)   │
          └─────────────────┘                      └────────┬────────┘
                                                            │
                                            ┌───────────────┴───────────────┐
                                            ▼                               ▼
                                   ┌─────────────────┐             ┌─────────────────┐
                                   │    marsai-db    │             │ ./marsai-uploads│
                                   │ (MariaDB 10.11) │             │ (Volume partagé)│
                                   └─────────────────┘             └────────┬────────┘
                                                                            │ (surveillance inotify)
                                                                            ▼
                                                                   ┌─────────────────┐
                                                                   │ marsai-watchdog │
                                                                   │ (ClamAV Démon)  │
                                                                   └─────────────────┘
```

| Service | Rôle | Port interne | Description |
| :--- | :--- | :--- | :--- |
| **`marsai-frontend`** | Interface utilisateur | `80` | Application React/Vite/Tailwind compilée et servie par un conteneur léger Nginx. |
| **`marsai-backend`** | API & Logique métier | `3000` | API Node.js / Express (TypeScript), gestion des utilisateurs, films, votes et uploads. |
| **`marsai-db`** | Base de données | `3306` | MariaDB 10.11. Schéma initialisé automatiquement depuis `./marsai-backend/database/db.sql`. |
| **`marsai-watchdog`** | Sécurité / Antivirus | - | Conteneur ClamAV surveillant en direct `./marsai-uploads` pour détruire tout malware téléversé. |

---

## 📋 Prérequis

* **Docker Engine** (version 24.0+) et le plugin **Docker Compose v2** (`docker compose version`).
* **Git**.

---

## 📁 Structure du Monorepo

```text
Marsai/
├── docker-compose.yml         # Fichier principal d'orchestration de tous les services
├── .env.example               # Modèle des variables d'environnement
├── .env                       # Variables d'environnement locales (non versionné)
├── marsai-uploads/            # Volume local partagé pour les fichiers téléversés
├── marsai-frontend/           # [Frontend] Application React 19, TypeScript, Vite & Tailwind
│   ├── src/                   # Code source de l'interface
│   ├── nginx.conf             # Configuration du serveur web Nginx de production
│   └── Dockerfile             # Build multi-stage (Build Vite -> Nginx)
├── marsai-backend/            # [Backend] API REST Express 5, TypeScript, JWT & MariaDB
│   ├── database/db.sql        # Script SQL d'initialisation de la BDD
│   ├── scripts/create-admin.ts# Script d'initialisation du compte administrateur
│   └── Dockerfile             # Conteneur Node.js d'exécution de l'API
└── marsai-clamav-watchdog/    # [Sécurité] Chien de garde antivirus ClamAV
    ├── Dockerfile             # Conteneur Alpine Linux avec ClamAV et inotify-tools
    ├── entrypoint.sh          # Téléchargement et actualisation continue de la base virale
    └── watchdog.sh            # Boucle inotifywait et destruction automatique des malwares
```

---

## 🚀 Tutoriel d'installation pas-à-pas

### Étape 1 : Cloner le Monorepo

Clonez le dépôt unique qui contient désormais tous les sous-projets :

```bash
git clone git@github.com:paguera/Marsai.git
cd Marsai
```

> [!TIP]
> Tous les sous-projets étant unifiés dans ce dépôt, un seul `git clone` suffit pour disposer immédiatement de l'intégralité du code et de la configuration de déploiement.

---

### Étape 2 : Créer le réseau Docker externe

Le fichier `docker-compose.yml` utilise un réseau externe nommé **`nas-net`**. Il permet aux conteneurs de communiquer entre eux et d'être exposés via un Reverse Proxy (Traefik, Nginx Proxy Manager, etc.).

Créez ce réseau avant le premier démarrage :

```bash
docker network create nas-net
```

> [!NOTE]
> Si ce réseau existe déjà sur votre machine hôte (ex: sur votre NAS), cette étape n'est pas nécessaire.

---

### Étape 3 : Configurer les variables d'environnement (`.env`)

Copiez le modèle de configuration fourni puis adaptez les variables :

```bash
cp .env.example .env
nano .env
```

Renseignez-y les variables suivantes (en adaptant les mots de passe et URLs) :

```dotenv
# ==============================================================================
# Configuration Générale & URLs
# ==============================================================================
# Port d'écoute interne de l'API (par défaut 3000)
PORT=3000

# URL publique de l'API Backend (utilisée par le frontend et les liens absolus)
BASE_URL=https://api.marsai.example.com

# URL publique du Frontend (utilisée pour valider les requêtes CORS)
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
# Clé secrète pour signer les tokens de session (générez une chaîne aléatoire)
JWT_SECRET=generer_une_longue_chaine_aleatoire_ici

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

Le dossier `./marsai-uploads` stocke les images et fichiers envoyés par les utilisateurs. Il est partagé entre le backend et l'antivirus ClamAV.

Créez-le et appliquez les permissions appropriées pour permettre l'écriture :

```bash
mkdir -p marsai-uploads
chmod 775 marsai-uploads
```

---

### Étape 5 : Démarrer la stack

Lancez la compilation des images et le démarrage des conteneurs en arrière-plan :

```bash
docker compose up -d --build
```

#### Vérifier l'état d'exécution :
```bash
docker compose ps
```
Tous les conteneurs (`marsai-db`, `marsai-backend`, `marsai-frontend`, `marsai-watchdog`) doivent être au statut `Up` (ou `healthy` pour la base de données).

#### Suivre les logs de démarrage :
```bash
docker compose logs -f
```

> [!TIP]
> Au premier lancement de `marsai-watchdog`, ClamAV télécharge la dernière base virale officielle (`main.cvd`, `daily.cvd`). Cette étape peut prendre 1 à 2 minutes selon votre débit Internet.

---

### Étape 6 : Créer le premier compte administrateur

Un script interactif est fourni dans le backend pour créer un utilisateur avec le rôle `ADMIN` en base de données :

```bash
docker compose exec marsai-backend npm run create-admin
```

Le script vous demandera :
* L'email de l'administrateur
* Le mot de passe
* Le prénom
* Le nom

Vous pouvez également passer directement les paramètres en argument :
```bash
docker compose exec marsai-backend npm run create-admin admin@marsai.fr "SuperPassword123!" John Doe
```

---

## 🌐 Accès et Reverse Proxy

Par défaut, le fichier `docker-compose.yml` ne publie pas de ports directement sur l'hôte (`ports:` n'est pas utilisé) afin de privilégier le réseau isolé **`nas-net`**.

### 1. Avec un Reverse Proxy (Recommandé en production)
Si vous utilisez **Nginx Proxy Manager**, **Traefik** ou **Caddy** connecté à `nas-net` :

* Pointez votre domaine Frontend (ex: `marsai.domaine.fr`) vers :
  * **Hôte :** `marsai-frontend`
  * **Port :** `80`
* Pointez votre domaine API (ex: `api-marsai.domaine.fr`) vers :
  * **Hôte :** `marsai-backend`
  * **Port :** `3000`

### 2. Accès direct en développement local (Optionnel)
Si vous développez en local sans reverse proxy, vous pouvez exposer les ports directement sur votre machine en ajoutant la section `ports` dans `docker-compose.yml` :

```yaml
  marsai-frontend:
    # ...
    ports:
      - "8080:80"

  marsai-backend:
    # ...
    ports:
      - "3000:3000"
```
Vous pourrez alors accéder au frontend sur `http://localhost:8080` et à l'API sur `http://localhost:3000`.

---

## 🛡️ Fonctionnement de l'Antivirus (Watchdog ClamAV)

Le conteneur `marsai-watchdog` assure la sécurité en temps réel :

1. **Surveillance d'événements (`inotifywait`)** : Le démon surveille récursivement tout ajout de fichier (`close_write`, `moved_to`) dans le volume partagé `./marsai-uploads`.
2. **Scan via socket (`clamdscan`)** : Dès qu'un fichier est écrit sur le disque, il est analysé par le socket local de `clamd`.
3. **Suppression immédiate en cas d'infection** : Si un malware ou virus est détecté (code retour `1`), le script détruit immédiatement le fichier (`rm -f`) et consigne une alerte de sécurité critique dans les logs Docker.
4. **Mise à jour automatique** : Le démon `freshclam` tourne en arrière-plan et actualise les signatures toutes les 2 heures.

#### Tester l'antivirus (Fichier de test EICAR) :
Vous pouvez vérifier le bon fonctionnement de la suppression en créant un faux virus dans le dossier d'uploads :

```bash
# Générer la signature de test standard EICAR
echo 'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' > marsai-uploads/test_virus.txt

# Observer la détection et la suppression dans les logs
docker compose logs -f marsai-watchdog
```
*Le fichier `marsai-uploads/test_virus.txt` doit être supprimé automatiquement en une fraction de seconde.*

---

## 🛠️ Commandes utiles au quotidien

| Action | Commande |
| :--- | :--- |
| **Démarrer les services** | `docker compose up -d` |
| **Arrêter les services** | `docker compose down` |
| **Reconstruire après mise à jour du code** | `docker compose up -d --build` |
| **Voir les logs complets** | `docker compose logs -f` |
| **Voir les logs d'un service spécifique** | `docker compose logs -f marsai-backend` |
| **Voir les alertes de l'antivirus** | `docker compose logs -f marsai-watchdog` |
| **Vérifier l'état de santé de la BDD** | `docker compose ps marsai-db` |
| **Accéder au shell d'un conteneur** | `docker compose exec marsai-backend bash` |
| **Créer un administrateur** | `docker compose exec marsai-backend npm run create-admin` |

---

## 🔧 Dépannage courant

### Erreur : `network nas-net not found`
Le réseau externe n'existe pas. Créez-le avec :
```bash
docker network create nas-net
```

### Le backend n'arrive pas à se connecter à la base de données
1. Vérifiez que la base MariaDB est prête et en bonne santé :
   ```bash
   docker compose ps marsai-db
   ```
2. Vérifiez que les variables `MARSAI_DB_NAME`, `MARSAI_DB_USER` et `MARSAI_DB_PASSWORD` dans `.env` correspondent bien aux identifiants attendus.

### Problème de permissions sur `marsai-uploads`
Si le conteneur backend ou le watchdog ne parvient pas à écrire ou supprimer des fichiers :
```bash
sudo chmod -R 775 marsai-uploads
```
