# 🏥 MedisMart - Guide de Configuration

## 🚀 Démarrage

### Backend (Laravel)

1. **Installer les dépendances**
```bash
cd medismart-back
composer install
```

2. **Créer le fichier .env**
```bash
cp .env.example .env
php artisan key:generate
```

3. **Configurer la base de données** dans `.env`
```
DB_DATABASE=medismart_db
DB_USERNAME=root
DB_PASSWORD=
```

4. **Lancer les migrations**
```bash
php artisan migrate
```

5. **Lancer le serveur Laravel** (sur le port 8000)
```bash
php artisan serve
```

### Frontend (React)

1. **Installer les dépendances**
```bash
cd my-app
npm install
```

2. **Lancer le serveur Vite**
```bash
npm run dev
```

L'app sera disponible à `http://localhost:5173`

---

## 🔐 Authentification - Flux

```
1. Utilisateur s'inscrit/se connecte (pages /register ou /login)
2. AuthService envoie requête POST à l'API Laravel
3. Laravel crée un token Sanctum
4. Token + User stockés dans localStorage
5. AuthContext met à jour l'état global
6. ProtectedRoute vérifie le rôle et affiche la page ou redirige
```

## 📚 exemple API Endpoints (Laravel)

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Créer un compte |
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/logout` | Déconnexion |
| GET | `/api/auth/me` | Obtenir l'utilisateur connecté |

### Exemple de requête

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "role": "patient"
  }'
```

## 🎯 Rôles et Permissions

### Patient
- `/patient/dashboard` - Tableau de bord personnel
- Voir ses rendez-vous
- Accéder à ses dossiers médicaux

### Médecin
- `/doctor/dashboard` - Tableau de bord professionnel
- Gérer ses patients
- Accéder aux dossiers médicaux

### Administrateur
- `/admin/dashboard` - Gestion du système
- Gérer tous les utilisateurs
- Consulter les rapports

## 🛡️ Sécurité

- Les tokens sont stockés en localStorage
- Les routes protégées vérifient le rôle avant d'afficher le contenu
- Les mots de passe sont hashés avec bcrypt en backend
