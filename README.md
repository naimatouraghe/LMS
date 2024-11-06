# LMSAPP API Documentation

## Authentification

L'API utilise JWT pour l'authentification. Pour obtenir un token :

1. Utilisez l'endpoint `/api/auth/login`
2. Incluez le token dans le header : `Authorization: Bearer [token]`

## Endpoints

### 🔑 Authentification (`/api/auth`)

- `POST /register` : Inscription d'un nouvel utilisateur
- `POST /login` : Connexion utilisateur
- `POST /logout` : Déconnexion (authentifié)
- `GET /users` : Liste des utilisateurs (Admin)
- `GET /users/{userId}` : Détails d'un utilisateur (authentifié)
- `PUT /users/{userId}` : Mise à jour d'un utilisateur (Admin)
- `DELETE /users/{userId}` : Suppression d'un utilisateur (Admin)
- `POST /users/{userId}/role` : Attribution d'un rôle (Admin)
- `GET /statistics` : Statistiques utilisateurs (Admin)

### 📚 Cours (`/api/courses`)

#### Gestion des cours

- `POST /` : Création d'un cours (Teacher)
- `GET /` : Liste des cours
- `GET /{courseId}` : Détails d'un cours
- `PUT /{courseId}` : Mise à jour d'un cours (Teacher)
- `DELETE /{courseId}` : Suppression d'un cours (Teacher/Admin)
- `GET /user/{userId}` : Cours d'un utilisateur (authentifié)

#### Chapitres

- `POST /{courseId}/chapters` : Ajout d'un chapitre (Teacher)
- `PUT /chapters/{chapterId}` : Mise à jour d'un chapitre (Teacher)
- `DELETE /chapters/{chapterId}` : Suppression d'un chapitre (Teacher)
- `PUT /{courseId}/chapters/reorder` : Réorganisation des chapitres (Teacher)
- `GET /{courseId}/chapters` : Liste des chapitres d'un cours

#### Pièces jointes

- `POST /{courseId}/attachments` : Ajout d'une pièce jointe (Teacher)
- `DELETE /attachments/{attachmentId}` : Suppression d'une pièce jointe (Teacher)
- `GET /{courseId}/attachments` : Liste des pièces jointes d'un cours

#### Catégories

- `GET /categories` : Liste des catégories
- `POST /categories` : Création d'une catégorie (Admin)
- `PUT /categories/{categoryId}` : Mise à jour d'une catégorie (Admin)
- `DELETE /categories/{categoryId}` : Suppression d'une catégorie (Admin)

#### Analytics et Progression

- `GET /analytics/teacher` : Statistiques enseignant (Teacher)
- `GET /purchased` : Cours achetés (authentifié)
- `GET /{courseId}/progress` : Progression dans un cours (authentifié)
- `GET /{courseId}/purchased` : Vérification d'achat d'un cours (authentifié)

### 📊 Progression (`/api/progress`)

- `POST /` : Création d'une progression (authentifié)
- `GET /{progressId}` : Détails d'une progression (authentifié)
- `PUT /{progressId}` : Mise à jour d'une progression (authentifié)
- `DELETE /{progressId}` : Suppression d'une progression (authentifié)
- `POST /chapters/{chapterId}/complete` : Marquer un chapitre comme complété (authentifié)
- `POST /chapters/{chapterId}/uncomplete` : Démarquer un chapitre comme complété (authentifié)
- `GET /courses/{courseId}` : Progression dans un cours (authentifié)
- `GET /` : Toutes les progressions de l'utilisateur (authentifié)
- `GET /courses/{courseId}/percentage` : Pourcentage de complétion d'un cours (authentifié)

### 💳 Paiements (`/api/payment`)

#### Gestion des clients Stripe

- `POST /customers` : Création d'un client Stripe (authentifié)
- `GET /customers` : Détails du client Stripe (authentifié)
- `PUT /customers` : Mise à jour du client Stripe (authentifié)

#### Gestion des achats

- `POST /purchases/{courseId}` : Achat d'un cours (authentifié)
- `GET /purchases` : Liste des achats de l'utilisateur (authentifié)
- `GET /courses/{courseId}/purchases` : Liste des achats d'un cours (Admin/Teacher)

#### Session de paiement

- `POST /create-checkout-session/{courseId}` : Création d'une session de paiement (authentifié)
- `POST /webhook` : Webhook Stripe (public)

## Légende des rôles

- `(authentifié)` : Utilisateur connecté requis
- `(Admin)` : Rôle administrateur requis
- `(Teacher)` : Rôle enseignant requis
- `(public)` : Aucune authentification requise
