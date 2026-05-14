# 🌍 Guide du Système de Traduction next-intl

## 📋 Vue d'ensemble

Votre projet utilise **next-intl** - une solution professionnelle de traduction multilingue pour Next.js 16+ avec supp Full TypeScript et optimisation des performances.

### Locales supportées
- **FR** (Français) - Locale par défaut
- **EN** (English)

---

## 📁 Structure du projet

```
src/
├── i18n/
│   ├── routing.ts              # Configuration des locales
│   ├── request.ts              # Accès aux traductions côté serveur
│   └── locales/
│       ├── fr.json             # Traductions françaises
│       └── en.json             # Traductions anglaises
├── app/
│   ├── page.tsx                # Redirection vers locale par défaut
│   ├── [locale]/               # Dossier de paramètre locale
│   │   ├── layout.tsx          # Layout racine localisé
│   │   ├── (public)/           # Pages publiques
│   │   ├── (auth)/             # Pages d'authentification
│   │   └── dashboard/          # Pages du tableau de bord
│   └── api/                    # Routes API (pas de locale)
├── components/
│   ├── LanguageSwitcher.tsx    # Sélecteur de langue
│   ├── public/                 # Composants publics
│   └── dashboard/              # Composants du dashboard
└── middleware.ts               # Gestion du routing multilingue

```

---

## 🚀 Comment utiliser les traductions

### 1️⃣ Dans les Server Components

```tsx
import { getTranslations } from 'next-intl/server'

export default async function MyComponent() {
  const t = await getTranslations('namespace')
  
  return <h1>{t('key')}</h1>
}
```

### 2️⃣ Dans les Client Components

```tsx
'use client'
import { useTranslations, useLocale } from 'next-intl'

export default function MyComponent() {
  const t = useTranslations('namespace')
  const locale = useLocale() // 'fr' ou 'en'
  
  return <h1>{t('key')}</h1>
}
```

### 3️⃣ Créer des URLs localisées

```tsx
import { useLocale } from 'next-intl'

export default function MyComponent() {
  const locale = useLocale()
  
  return <Link href={`/${locale}/contact`}>Contacter</Link>
}
```

---

## 📚 Namespaces disponibles

Les traductions sont organisées par sections (namespaces) dans `fr.json` et `en.json` :

### **nav**
- `courses`, `publications`, `supervisions`, `collaborators`, `contact`, `dashboard`, `logout`

### **home**
- `publications`, `courses`, `supervisions`, `collaborators`
- `hero.*`, `about.*`, `research.*`, `specializations`, `degrees`

### **auth**
- `login.*` - Page de connexion
- `register.*` - Page d'inscription
- `forgotPassword.*` - Réinitialisation du mot de passe
- `resetPassword.*` - Créer un nouveau mot de passe

### **dashboard**
- `title`, `overview`, `courses`, `publications`, `supervisions`, `collaborators`, `users`, `messages`, `profile`
- `add`, `edit`, `delete`, `cancel`, `save`, `loading`, `noData`
- Actions et messages d'erreur

### **contact**
- `pageTitle`, `pageSubtitle`
- Champs du formulaire et messages

### **footer**
- Identité, navigation, contact, copyright

### **common**
- Actions générales : `save`, `cancel`, `delete`, `edit`, `add`, `loading`, `error`, `success`, `logout`, `profile`, `settings`, `language`

---

## 🔄 Ajouter une nouvelle traduction

### Étape 1 : Ajouter aux fichiers JSON

**src/i18n/locales/fr.json :**
```json
{
  "myNamespace": {
    "myKey": "Mon texte en français"
  }
}
```

**src/i18n/locales/en.json :**
```json
{
  "myNamespace": {
    "myKey": "My text in English"
  }
}
```

### Étape 2 : Utiliser dans votre composant

```tsx
'use client'
import { useTranslations } from 'next-intl'

export default function MyComponent() {
  const t = useTranslations('myNamespace')
  
  return <p>{t('myKey')}</p>
}
```

---

## 🎯 Routing multilingue

### URLs automatiquement générées

- `http://localhost:3000/fr/courses` → Page des cours en français
- `http://localhost:3000/en/courses` → Page des cours en anglais
- `http://localhost:3000/` → Redirige vers `/fr` (locale par défaut)

### Changer de langue

Le composant `LanguageSwitcher` intégré permet aux utilisateurs de changer de langue et reste sur la même page :

```tsx
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function Navbar() {
  return (
    <div>
      <LanguageSwitcher /> {/* Sélecteur 🇫🇷 / 🇬🇧 */}
    </div>
  )
}
```

---

## 📊 Format des messages dans les JSON

### Texte simple
```json
{
  "button": "Cliquez ici"
}
```

### Texte avec variables
```json
{
  "greeting": "Bonjour {name}!"
}
```

Utilisation :
```tsx
const t = useTranslations()
<p>{t('greeting', { name: 'Jean' })}</p>
```

### Listes (arrays)
```json
{
  "items": ["Item 1", "Item 2", "Item 3"]
}
```

Utilisation :
```tsx
const t = useTranslations()
const items = t.raw('items')
items.forEach(item => console.log(item))
```

---

## 🔒 Middleware de sécurité

Le fichier `middleware.ts` gère automatiquement :
- ✅ Détection de la locale
- ✅ Redirection vers locale appropriée
- ✅ Validation des locales supportées
- ✅ Exclusion des routes statiques (API, images, etc.)

---

## 🛠️ Configuration (next.config.ts)

```typescript
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  // Votre configuration Next.js
}

export default withNextIntl(nextConfig)
```

---

## 📝 Exemple complet : Page de contact

### Page : `src/app/[locale]/(public)/contact/page.tsx`

```tsx
'use client'
import { useTranslations, useLocale } from 'next-intl'

export default function ContactPage() {
  const t = useTranslations('contact')
  const locale = useLocale()

  return (
    <div>
      <h1>{t('pageTitle')}</h1>
      <p>{t('pageSubtitle')}</p>
      <form>
        <label>{t('fullName')}</label>
        <input placeholder={t('fullNamePlaceholder')} />
        
        <button type="submit">{t('submit')}</button>
      </form>
    </div>
  )
}
```

### Traductions :

**fr.json :**
```json
{
  "contact": {
    "pageTitle": "Contact",
    "pageSubtitle": "Pour toute demande de collaboration",
    "fullName": "Nom complet",
    "fullNamePlaceholder": "Jean Dupont",
    "submit": "Envoyer"
  }
}
```

**en.json :**
```json
{
  "contact": {
    "pageTitle": "Contact",
    "pageSubtitle": "For any collaboration request",
    "fullName": "Full Name",
    "fullNamePlaceholder": "John Doe",
    "submit": "Send"
  }
}
```

---

## 🚨 Bonnes pratiques

### ✅ À FAIRE
- Organiser les traductions par sections (namespaces)
- Utiliser des clés descriptives en camelCase
- Tracer les deux langues simultanément
- Tester les deux locales avant de déployer
- Mettre à jour les deux fichiers JSON ensemble

### ❌ À ÉVITER
- Hardcoder du texte en français/anglais
- Mélanger les namespaces
- Oublier de traduire dans une langue
- Utiliser des clés génériques (`text`, `message`, etc.)
- Modifier les fichiers JSON directement sans test

---

## 🧪 Tester votre traduction

1. **Localement en français :**
   ```
   http://localhost:3000/fr/courses
   ```

2. **Localement en anglais :**
   ```
   http://localhost:3000/en/courses
   ```

3. **Vérifier la bascule de langue :**
   - Cliquer sur le LanguageSwitcher (drapeau)
   - Vérifier que l'URL change
   - Vérifier que le contenu change

---

## 📦 Déploiement

Votre configuration est prête pour le déploiement sur :
- ✅ Vercel
- ✅ Netlify
- ✅ Any Node.js server

Aucune configuration supplémentaire nécessaire ! 🎉

---

## 🔗 Ressources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [i18n Best Practices](https://www.w3.org/International/questions/qa-what-is-i18n)

---

**Auteur du système :** GitHub Copilot  
**Date de création :** Avril 2026  
**Version :** 1.0.0
