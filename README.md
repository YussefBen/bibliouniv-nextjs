```markdown
# BiblioUniv — Gestion de Bibliothèque Universitaire

Application web Next.js + Prisma + MySQL pour la gestion des emprunts et des ouvrages d'une bibliothèque universitaire.

## Prérequis

Avant de lancer le projet, il faut avoir installé :

- **Node.js** (version 20 recommandée)
- **npm**
- **Un service MySQL** (Aiven recommandé ou MySQL Workbench en local)

---

# 1. Déploiement en production (Vercel)

## Étape 1 — Configurer le projet sur Vercel
Importer le dépôt GitHub sur votre interface Vercel.

---

## Étape 2 — Configurer les variables d'environnements 
Dans les paramètres Vercel (**Settings > Environment Variables**), ajouter :

```bash
DATABASE_URL=votre_url_mysql_aiven
JWT_ACCESS_SECRET=votre_secret_access_32_caracteres
JWT_REFRESH_SECRET=votre_secret_refresh_32_caracteres

```

## Étape 3 — Accéder à l'application

L'application sera disponible à l'adresse suivante :

```bash
[https://bibliouniv-app.vercel.app/](https://bibliouniv-app.vercel.app/)

```

---

# 2. Lancement en local (sans Docker)

## Étape 1 — Extraire le projet

Décompresser le fichier `.zip` ou cloner le dépôt dans un dossier local.

---

## Étape 2 — Installer les dépendances

Ouvrir un terminal à la racine du projet puis exécuter :

```bash
npm install

```

## Étape 3 — Configurer les variables d'environnements

Créer un fichier: `.env`

Avec le contenu suivant :

```bash
DATABASE_URL="mysql://user:password@host:port/defaultdb"
JWT_ACCESS_SECRET="change_me_super_secret_access"
JWT_REFRESH_SECRET="change_me_super_secret_refresh"

```

## Étape 4 — Synchroniser la base de données

Pour créer les tables et synchroniser le schéma avec Prisma, exécutez :

```bash
npx prisma generate
npx prisma db push

```

## Étape 5 — Lancer l'application

Ouvrir un terminal à la racine du projet puis exécuter :

```bash
npm run dev

```

L’application sera accessible à l’adresse :

```bash
http://localhost:3000

```


## 3. Règles métier implémentées

* **Sécurité** : Authentification via double token JWT (Access/Refresh) en cookies HttpOnly.
* **Limites d'emprunt** : Maximum 3 livres par utilisateur simultanément.
* **Durée** : Emprunts fixés à 14 jours.
* **Disponibilité** : Seuls les livres en stock peuvent être sélectionnés pour un emprunt.

