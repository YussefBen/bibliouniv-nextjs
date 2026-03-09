BiblioUniv — Gestion de Bibliothèque Universitaire

Concepteurs: BEN CHOUCHANE Youssef et DA SALVA MESQUITA Rafael

Application web Next.js 15 + Prisma + MySQL pour la gestion moderne des emprunts et des ouvrages universitaires.

Prérequis
Avant de lancer le projet, il faut avoir installé :

Node.js (version 20 ou supérieure recommandée)

npm (inclus avec Node.js)

Un compte Aiven (ou un serveur MySQL local)

1. Déploiement en Production (Vercel)
Étape 1 — Configuration sur Vercel
Importer le projet depuis GitHub sur le tableau de bord Vercel.

Étape 2 — Configurer les variables d'environnements
Dans les paramètres du projet Vercel, ajouter les clés suivantes :

DATABASE_URL : Votre lien de connexion MySQL (Aiven)

JWT_ACCESS_SECRET : Une clé secrète pour les Access Tokens

JWT_REFRESH_SECRET : Une clé secrète pour les Refresh Tokens

Étape 3 — Accéder à l'application
L'application sera disponible à l'adresse fournie par Vercel (ex: https://bibliouniv-app.vercel.app/).

2. Lancement en local (Développement)
Étape 1 — Extraire le projet
Décompresser le fichier .zip ou cloner le dépôt dans un dossier local :

Bash
git clone https://github.com/YussefBen/bibliouniv-nextjs.git
Étape 2 — Installer les dépendances
Ouvrir un terminal à la racine du projet puis exécuter :

Bash
npm install
Étape 3 — Configurer les variables d'environnements
Créer un fichier .env à la racine avec le contenu suivant :

Extrait de code
DATABASE_URL="mysql://user:password@host:port/defaultdb"
JWT_ACCESS_SECRET="votre_secret_access_ici"
JWT_REFRESH_SECRET="votre_secret_refresh_ici"
Étape 4 — Synchroniser la base de données
Pour créer les tables (User, Book, Borrowing) sur votre instance MySQL, exécutez :

Bash
npx prisma db push
Étape 5 — Lancer l'application
Ouvrir un terminal à la racine du projet puis exécuter :

Bash
npm run dev
L’application sera accessible à l’adresse :
http://localhost:3000

3. Fonctionnalités implémentées
Authentification sécurisée : Double token JWT (Access & Refresh) stockés en cookies HttpOnly.

Gestion métier :

Limitation stricte à 3 emprunts simultanés par étudiant.

Durée d'emprunt fixée à 14 jours.

Vérification de la disponibilité en temps réel.

Interface : Catalogue paginé avec recherche dynamique et espace profil personnel.