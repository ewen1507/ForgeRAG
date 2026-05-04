# ForgeRAG

ForgeRAG est un projet de RAG sécurisé destiné à fournir une plateforme permettant d’uploader des documents, de les indexer dans une base vectorielle, puis de poser des questions dessus à l’aide d’un modèle de langage local.

Le projet est construit comme une application complète avec :

- un backend principal en NestJS ;
- une base de données PostgreSQL ;
- un service RAG en Python avec FastAPI ;
- une base vectorielle ChromaDB ;
- un frontend en React/Vite ;
- un LLM local lancé avec LM Studio.

L’objectif est d’avoir une architecture proche d’un projet production, avec authentification, historique des questions, séparation des services, et une logique RAG indépendante du backend principal.

---

## État actuel du projet

Le projet contient actuellement plusieurs parties fonctionnelles.

### Backend NestJS

Le backend est déjà en place avec :

- une API NestJS ;
- une connexion PostgreSQL via Prisma ;
- une authentification JWT ;
- une route de santé `/health` ;
- une route protégée pour récupérer l’historique RAG ;
- une communication prévue avec le service RAG.

Exemple de route déjà fonctionnelle :

```bash
curl http://localhost:3000/health
```

Réponse attendue :

```json
{
  "status": "ok",
  "database": "connected"
}
```

L’authentification fonctionne avec un token JWT, utilisé ensuite pour accéder aux routes protégées comme :

```http
GET /api/rag/history
```

---

### Base de données PostgreSQL

PostgreSQL est lancé via Docker Compose.

Le service est exposé sur le port :

```txt
5432
```

La base est utilisée par le backend NestJS, notamment pour :

- stocker les utilisateurs ;
- gérer l’authentification ;
- conserver l’historique des questions/réponses RAG.

---

### Frontend React / Vite

Le frontend est lancé via Docker Compose et exposé sur :

```txt
http://localhost:5173
```

Il servira d’interface utilisateur pour :

- se connecter ;
- envoyer des documents ;
- poser des questions ;
- afficher les réponses du RAG ;
- consulter l’historique.

L’interface est encore en cours de développement.

---

### Service RAG FastAPI

Le service RAG est développé en Python avec FastAPI.

Il est responsable de :

- recevoir les documents ;
- découper les documents en chunks ;
- générer les embeddings ;
- stocker les chunks dans ChromaDB ;
- rechercher les passages les plus pertinents ;
- envoyer le contexte au LLM ;
- retourner une réponse générée.

Exemples de routes utilisées :

```http
POST /ingest
GET /vector-store/count
GET /vector-store/peek
POST /retrieve
POST /generate
```

Exemple de récupération de chunks pertinents :

```bash
curl http://localhost:8000/retrieve \
  -H "Content-Type: application/json" \
  -d '{"query":"Who created Python?","top_k":3}'
```

Exemple de réponse :

```json
{
  "results": [
    {
      "chunk_id": "doc-pdf-1-chunk-870",
      "document_id": "doc-pdf-1",
      "filename": "PythonTutorial.pdf",
      "source_type": "file",
      "text": "Guido remains Python’s principal author...",
      "distance": 0.537
    }
  ]
}
```

---

### ChromaDB

ChromaDB est utilisé comme base vectorielle.

Elle permet de stocker :

- les chunks de documents ;
- les embeddings ;
- les métadonnées associées aux documents.

Les métadonnées peuvent contenir par exemple :

```json
{
  "document_id": "doc-pdf-1",
  "filename": "PythonTutorial.pdf",
  "source_type": "file"
}
```

---

### LLM local avec LM Studio

Le modèle de langage est lancé localement avec LM Studio.

Actuellement, le LLM ne tourne pas dans Docker. Il doit donc être lancé séparément sur la machine hôte.

Cela implique que le service RAG doit être capable d’accéder à l’API locale de LM Studio.

Par défaut, LM Studio expose généralement une API compatible OpenAI sur :

```txt
http://localhost:1234/v1
```

Si le service RAG tourne dans Docker, il ne peut pas forcément accéder à `localhost`, car `localhost` représente le conteneur lui-même.

Dans ce cas, il faut utiliser :

```txt
http://host.docker.internal:1234/v1
```

Dans le fichier d’environnement du service RAG, on peut donc avoir :

```env
LLM_BASE_URL=http://host.docker.internal:1234/v1
LLM_API_KEY=lm-studio
LLM_MODEL=nom-du-modele-charge
```

Important : un modèle doit être chargé dans LM Studio avant d’appeler la route de génération.

Sinon, LM Studio peut retourner une erreur du type :

```txt
No models loaded. Please load a model in the developer page or use the lms load command
```

---

## Architecture globale

```txt
ForgeRAG/
│
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
│
├── rag-service/
│   ├── app/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── main.py
│
├── docker-compose.yml
└── README.md
```

Architecture logique :

```txt
Utilisateur
   │
   ▼
Frontend React
   │
   ▼
Backend NestJS
   │
   ├── PostgreSQL
   │
   ▼
Service RAG FastAPI
   │
   ├── ChromaDB
   │
   ▼
LM Studio / LLM local
```

---

## Prérequis

Avant de lancer le projet, il faut installer :

- Docker ;
- Docker Compose ;
- Node.js si lancement hors Docker ;
- Python 3.11+ si lancement hors Docker ;
- LM Studio pour lancer un modèle local ;
- un modèle compatible avec LM Studio.

---

## Installation

Cloner le projet :

```bash
git clone <url-du-repo>
cd ForgeRAG
```

Créer les fichiers d’environnement si nécessaire.

Exemple pour le backend :

```env
DATABASE_URL="postgresql://postgres:postgres@db:5432/forgerag"
JWT_SECRET="your-secret-key"
PORT=3000
```

Exemple pour le service RAG :

```env
LLM_BASE_URL=http://host.docker.internal:1234/v1
LLM_API_KEY=lm-studio
LLM_MODEL=local-model
CHROMA_PATH=/app/chroma
```

---

## Lancement avec Docker Compose

Lancer tous les services :

```bash
docker compose up --build
```

Vérifier les services :

```bash
docker compose ps
```

Exemple attendu :

```txt
NAME                  SERVICE      STATUS
forgerag-backend-1    backend      Up
forgerag-db           db           Up
forgerag-frontend-1   frontend     Up
forgerag-rag-service  rag-service  Up
```

---

## Ports utilisés

| Service | Port |
|---|---:|
| Frontend | 5173 |
| Backend NestJS | 3000 |
| PostgreSQL | 5432 |
| RAG Service FastAPI | 8000 |
| LM Studio | 1234 |

---

## Utilisation

### 1. Vérifier le backend

```bash
curl http://localhost:3000/health
```

Réponse attendue :

```json
{
  "status": "ok",
  "database": "connected"
}
```

---

### 2. Créer un utilisateur

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password"
  }'
```

Réponse attendue :

```json
{
  "access_token": "jwt-token"
}
```

---

### 3. Se connecter

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password"
  }'
```

---

### 4. Accéder à l’historique RAG

```bash
curl http://localhost:3000/api/rag/history \
  -H "Authorization: Bearer <TOKEN>"
```

---

### 5. Tester le service RAG

Vérifier que le service RAG tourne :

```bash
curl http://localhost:8000/health
```

Compter les documents indexés :

```bash
curl http://localhost:8000/vector-store/count
```

Voir un aperçu des chunks :

```bash
curl "http://localhost:8000/vector-store/peek?limit=10"
```

Faire une recherche vectorielle :

```bash
curl http://localhost:8000/retrieve \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Who created Python?",
    "top_k": 3
  }'
```

---

### 6. Tester la génération avec le LLM

Avant cette étape, il faut :

1. ouvrir LM Studio ;
2. charger un modèle ;
3. activer le serveur local ;
4. vérifier que le port `1234` est actif.

Ensuite :

```bash
curl http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain what Python is in a few sentences."
  }'
```

---

## Problèmes connus

### `ModuleNotFoundError: No module named 'chromadb'`

Cela signifie que la dépendance `chromadb` n’est pas installée dans l’image Docker du service RAG.

Vérifier que `requirements.txt` contient bien :

```txt
chromadb
```

Puis reconstruire :

```bash
docker compose up --build
```

---

### LM Studio ne répond pas depuis Docker

Si le service RAG tourne dans Docker, il ne faut généralement pas utiliser :

```txt
http://localhost:1234/v1
```

Mais plutôt :

```txt
http://host.docker.internal:1234/v1
```

Dans le `.env` :

```env
LLM_BASE_URL=http://host.docker.internal:1234/v1
```

---

### Aucun modèle chargé dans LM Studio

Erreur possible :

```txt
No models loaded
```

Solution :

- ouvrir LM Studio ;
- aller dans l’onglet développeur ;
- charger un modèle ;
- lancer le serveur local.

---

### Confusion entre modèle LLM et modèle d’embedding

Un modèle chargé dans LM Studio n’est pas forcément utilisable comme modèle d’embedding.

Pour les embeddings, il vaut mieux utiliser un modèle adapté comme :

```txt
sentence-transformers/all-MiniLM-L6-v2
```

ou un autre modèle compatible avec la librairie utilisée côté Python.

---

## Commandes utiles

### Lancer le projet

```bash
docker compose up --build
```

### Lancer en arrière-plan

```bash
docker compose up -d --build
```

### Voir les logs

```bash
docker compose logs -f
```

### Voir les logs du backend

```bash
docker compose logs -f backend
```

### Voir les logs du service RAG

```bash
docker compose logs -f rag-service
```

### Stopper les conteneurs

```bash
docker compose down
```

### Stopper et supprimer les volumes

```bash
docker compose down -v
```

---

## Roadmap

### Déjà fait

- Mise en place du backend NestJS.
- Connexion à PostgreSQL.
- Mise en place de Prisma.
- Authentification JWT.
- Route `/health`.
- Route protégée pour l’historique RAG.
- Mise en place du frontend React/Vite.
- Mise en place du service RAG FastAPI.
- Mise en place de ChromaDB.
- Ingestion de documents.
- Découpage des documents en chunks.
- Recherche vectorielle fonctionnelle.
- Début d’intégration avec LM Studio.

---

### En cours

- Connexion propre entre le backend NestJS et le service RAG.
- Gestion complète des questions/réponses.
- Stockage des conversations dans PostgreSQL.
- Gestion des documents uploadés depuis le frontend.
- Amélioration du prompt RAG.
- Gestion des erreurs liées au LLM et aux embeddings.

---

### À faire

- Ajouter une route backend pour poser une question au RAG.
- Relier cette route au service FastAPI.
- Sauvegarder chaque question/réponse dans PostgreSQL.
- Ajouter l’upload de fichiers depuis le frontend.
- Ajouter une interface de chat.
- Afficher les sources utilisées dans les réponses.
- Ajouter une page d’historique.
- Ajouter la suppression de documents.
- Ajouter une gestion par utilisateur des documents.
- Ajouter des tests backend.
- Ajouter des tests du service RAG.
- Ajouter une documentation API.
- Préparer une version déployable.

---

## Objectif final

L’objectif final de ForgeRAG est de proposer une plateforme complète de RAG personnel ou professionnel.

Un utilisateur pourra :

1. créer un compte ;
2. se connecter ;
3. uploader ses documents ;
4. poser des questions ;
5. obtenir une réponse générée par un LLM local ;
6. consulter les sources utilisées ;
7. retrouver son historique ;
8. gérer ses documents.

Le projet permet aussi de montrer une architecture complète combinant :

- backend sécurisé ;
- base de données relationnelle ;
- base vectorielle ;
- service IA séparé ;
- frontend moderne ;
- modèle local.

---

## Stack technique

| Partie | Technologie |
|---|---|
| Frontend | React, Vite, TypeScript |
| Backend | NestJS, TypeScript |
| Base de données | PostgreSQL |
| ORM | Prisma |
| Authentification | JWT |
| RAG service | Python, FastAPI |
| Vector store | ChromaDB |
| LLM | LM Studio |
| Conteneurisation | Docker, Docker Compose |

---

## Auteur

Projet développé dans le cadre d’un projet personnel/portfolio autour des architectures RAG, des LLM locaux et des applications backend sécurisées.