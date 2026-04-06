# Backend ForgeRAG

## Description

Le backend de ForgeRAG est une API REST construite avec NestJS, utilisant Prisma comme ORM pour interagir avec une base de données PostgreSQL. Il fournit des fonctionnalités d'authentification JWT et de gestion des requêtes RAG (Retrieval-Augmented Generation).

## Technologies utilisées

- **NestJS** : Framework Node.js pour construire des applications serveur efficaces et scalables.
- **Prisma** : ORM moderne pour Node.js et TypeScript.
- **PostgreSQL** : Base de données relationnelle.
- **JWT** : Authentification basée sur les tokens JSON Web.
- **Passport** : Middleware d'authentification pour Node.js.
- **bcrypt** : Hachage des mots de passe.
- **class-validator** et **class-transformer** : Validation et transformation des données d'entrée.

## Installation

1. Assurez-vous d'avoir Node.js (version 22 ou supérieure) et npm installés.

2. Clonez le repository et naviguez vers le dossier backend :
   ```bash
   cd backend
   ```

3. Installez les dépendances :
   ```bash
   npm install
   ```

4. Configurez la base de données :
   - Assurez-vous que PostgreSQL est en cours d'exécution.
   - Créez une base de données nommée `forgerag`.
   - Mettez à jour la variable d'environnement `DATABASE_URL` dans votre fichier `.env` (ou utilisez docker-compose).

5. Générez le client Prisma :
   ```bash
   npx prisma generate
   ```

6. Appliquez les migrations de base de données :
   ```bash
   npx prisma migrate deploy
   ```

## Configuration

Créez un fichier `.env` à la racine du dossier backend avec les variables suivantes :

```
DATABASE_URL="postgresql://forgerag:forgerag_password@localhost:5432/forgerag"
JWT_SECRET="votre_secret_jwt"
PORT=3000
```

## Lancement

### Développement
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

### Avec Docker
Utilisez le docker-compose à la racine du projet pour lancer l'ensemble de l'application :
```bash
docker-compose up
```

## Structure du projet

- `src/app.module.ts` : Module principal de l'application.
- `src/auth/` : Module d'authentification (inscription, connexion, JWT).
- `src/rag/` : Module pour les requêtes RAG.
- `src/prisma/` : Module Prisma pour la connexion à la base de données.
- `src/users/` : Module utilisateurs (non encore intégré).
- `prisma/schema.prisma` : Schéma de la base de données.

## Modèles de données

### User
- `id` : Identifiant unique (UUID)
- `email` : Email unique de l'utilisateur
- `passwordHash` : Hash du mot de passe
- `createdAt` : Date de création
- `updatedAt` : Date de mise à jour
- `queries` : Relation vers les requêtes RAG de l'utilisateur

### RagQuery
- `id` : Identifiant unique (UUID)
- `question` : Question posée
- `answer` : Réponse générée (optionnelle)
- `userId` : ID de l'utilisateur
- `createdAt` : Date de création

## API Endpoints

L'API utilise le préfixe global `/api`.

### Authentification
- `POST /api/auth/register` : Inscription d'un nouvel utilisateur
- `POST /api/auth/login` : Connexion d'un utilisateur

### RAG
- `POST /api/rag/query` : Soumettre une requête RAG (nécessite authentification)
