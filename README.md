# Site académique — Pr. TCHUIFON Donald Raoul

Site vitrine bilingue (FR/EN) et espace d'administration pour présenter les
publications, cours, encadrements et collaborateurs du Pr. TCHUIFON Donald Raoul
(ENSPD, Université de Douala).

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19**
- **TypeScript**, **Tailwind CSS v4**
- **next-intl** (routing `/fr` et `/en`)
- **Prisma 7** + PostgreSQL (adapter `@prisma/adapter-pg`)
- **JWT** (`jsonwebtoken` côté Node, `jose` côté middleware) + cookies httpOnly
- **Cloudinary** pour les images et PDF
- **Nodemailer** pour les emails de contact et de réinitialisation
- **Zustand**, **React Hook Form**, **Zod**, **Framer Motion**

## Démarrage

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env
# puis renseigner DATABASE_URL, JWT_SECRET, CLOUDINARY_*, SMTP_*, etc.

# 3. Générer le client Prisma et appliquer les migrations
npm run db:deploy        # production / base existante
# ou
npm run db:migrate       # développement (crée une migration)

# 4. Créer le compte administrateur et les données d'exemple
npm run db:seed

# 5. Lancer le serveur
npm run dev
```

Le site est disponible sur [http://localhost:3000](http://localhost:3000) et
redirige automatiquement vers `/fr` (ou `/en`).

> `npm install` exécute automatiquement `prisma generate` via le script
> `postinstall`, ce qui évite les erreurs « module Prisma introuvable » au
> premier lancement.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | `prisma generate` + build de production |
| `npm start` | Serveur de production |
| `npm run lint` | ESLint |
| `npm run typecheck` | Vérification TypeScript |
| `npm run db:migrate` | Crée/applique une migration en développement |
| `npm run db:deploy` | Applique les migrations existantes |
| `npm run db:seed` | Crée/met à jour l'admin et les exemples |

## Variables d'environnement

Voir [`.env.example`](./.env.example). Les principales :

| Variable | Rôle |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | URL publique utilisée dans les emails (sans `/` final) |
| `DATABASE_URL` | Connexion PostgreSQL |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | Secrets de signature des tokens |
| `JWT_ACCESS_EXPIRES`, `JWT_REFRESH_EXPIRES` | Durées (`15m`, `7d`…) |
| `CLOUDINARY_*` | Upload des médias |
| `SMTP_*` | Envoi des emails |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | Compte créé par le seed |

> Les secrets ne doivent jamais être commités. `.env` est ignoré par Git ;
> `.env.example` sert de modèle.

## Organisation

```text
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx          # Layout racine (html/body, i18n)
│   │   ├── (public)/           # Site vitrine
│   │   ├── (auth)/             # Connexion / mot de passe
│   │   └── dashboard/          # Administration
│   ├── api/                    # Route Handlers (auth, CRUD, upload)
│   └── global-not-found.tsx
├── components/
│   ├── public/                 # Navbar, Footer, cartes, profil
│   ├── dashboard/              # Tableaux, formulaires, modales
│   └── ui/                     # Button, Input, Toast
├── i18n/                       # routing, request, navigation, messages
├── lib/                        # prisma, auth, jwt, session, mail, cloudinary
└── store/                      # Zustand
prisma/
├── schema.prisma
├── migrations/
└── seed.ts
```

## Routes principales

- `/fr`, `/en` — accueil
- `/[locale]/publications` et `/[locale]/publications/[slug]`
- `/[locale]/courses` et `/[locale]/courses/[id]`
- `/[locale]/supervisions` et `/[locale]/supervisions/[id]`
- `/[locale]/collaborators` et `/[locale]/collaborators/[id]`
- `/[locale]/contact`
- `/[locale]/login`, `/[locale]/forgot-password`, `/[locale]/reset-password`
- `/[locale]/dashboard/*` — protégé par le middleware et les route handlers
- `/[locale]/dashboard/slides` — gestion du carrousel de la section hero

## Carrousel de la page d'accueil

Les images du hero sont stockées dans la table `hero_slides` et gérées depuis
`/[locale]/dashboard/slides` :

- ajout par upload Cloudinary (JPEG, PNG, WebP) ;
- suppression avec retrait du fichier Cloudinary ;
- réordonnancement par flèches ;
- **aucune limite** sur le nombre d'images.

Au premier seed, les 9 images fournies dans `public/images/slides/` sont
insérées automatiquement. Si la table est vide ou indisponible, l'accueil
conserve un fond sombre lisible et les images par défaut servent de fallback
côté client.

## Authentification

- L'access token (15 min par défaut) et le refresh token (7 jours) sont stockés
  dans des cookies **httpOnly**.
- Le refresh token est enregistré en base et **tourne** à chaque utilisation.
- Le middleware renouvelle la session expirée avant d'afficher une page protégée.
- Les appels API du dashboard utilisent `apiFetch`, qui rejoue une requête après
  un `401` si le refresh token est encore valide.
- La réinitialisation du mot de passe stocke uniquement une empreinte SHA-256 du
  token envoyé par email.

## Déploiement

1. Renseigner les variables d'environnement sur la plateforme (Vercel, etc.).
2. Le build exécute automatiquement `prisma generate`.
3. Appliquer les migrations : `npm run db:deploy`.
4. Vérifier `NEXT_PUBLIC_APP_URL` et la configuration SMTP/Cloudinary.

## Traductions

Les messages sont dans `src/i18n/locales/fr.json` et `en.json`.
Voir [`TRANSLATION_GUIDE.md`](./TRANSLATION_GUIDE.md) pour l'utilisation de
`next-intl` et l'ajout de nouvelles clés.
