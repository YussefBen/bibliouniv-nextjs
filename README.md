# Projet Final - Gestion de Bibliothèque (BiblioUniv)

Ce projet est une application de gestion d'emprunts de livres pour une université. 
Réalisé avec Next.js 15, Prisma et MySQL.

## Lien de la démo (Vercel)
[https://bibliouniv-app.vercel.app/]

## Stack technique
- **Framework** : Next.js 15 (App Router)
- **Base de données** : MySQL (hébergée sur Aiven)
- **ORM** : Prisma
- **Auth** : JWT (Access + Refresh Token) gérés avec la bibliothèque `jose`
- **Validation** : Zod

## Installation locale

**Cloner le projet :**

git clone [https://github.com/YussefBen/BiblioUniv_Projet_Final_NextJS](https://github.com/YussefBen/BiblioUniv_Projet_Final_NextJS)

## Installer les modules :

npm install
Configurer le fichier .env à la racine :

Extrait de code
DATABASE_URL="votre_url_mysql_aiven"
JWT_ACCESS_SECRET="votre_secret_32_caracteres"
JWT_REFRESH_SECRET="un_autre_secret_32_caracteres"

## Lancer la base de données :

npx prisma generate
npx prisma db push


## Lancer le projet :

npm run dev