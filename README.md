# Projet de Développement d'une Application de Gestion de Projet

## Lancer l'application avec Docker Compose

### Prérequis

- Assurez-vous d'avoir Docker et Docker Compose installés sur votre machine.
- La configuration utilise des variables d'environnement définies dans des fichiers `.env`.
- Les fichiers `.env` doivent être placés dans les répertoires appropriés pour le backend et le frontend.

### Emplacement des .env

- Un fichier `.env` pour le backend doit être situé dans le répertoire `backend/`.
- Un fichier `.env` pour le frontend doit être situé dans le répertoire `frontend/`.
- Un fichier `.env` à la racine du projet peut être utilisé pour définir des variables globales, pour Docker Compose.

### Variables d'exemple

backend/.env:

```env
PORT=8080
HOST=0.0.0.0  

DB_NAME=database_name
MONGO_URI=mongodb://mongo:27017

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d
```

frontend/.env:

```env
VITE_API_URL=http://backend:8080
```

.env (à la racine du projet):

```env
PORT=8080
VITE_API_URL=http://backend:8080
MONGO_URI=mongodb://mongo:27017
DB_NAME=database_name
```

### Commande pour lancer le docker-compose

Dans le répertoire racine du projet, exécutez la commande suivante pour lancer les services définis dans le fichier `docker-compose.yml` :

```bash
docker-compose up --build -d
```

La commande `--build` force la reconstruction des images Docker. L'option `-d` exécute les conteneurs en arrière-plan.

### Arrêter l'application

```bash
docker-compose down
```
