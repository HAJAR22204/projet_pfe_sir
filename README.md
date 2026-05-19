#  Back-office Scolarité - Documentation des  tests API


---


## Tests API (Postman)

### Bases de données

| Base | Rôle | Technologie |
|------|------|-------------|
| `scolarite_db` | Application back-office | MySQL |
| `apoge_simule` | Simulation Apogée (données étudiants) | MySQL |

---


### Configuration Postman

**Base URL :** `http://localhost:8000`


## Authentification - Login 

**Méthode :** `POST`
**URL :** `http://localhost:8000/api/auth/login`

**Body :**
```json
{
  "email": "hajarzegour22@gmail.com",
  "password": "password"
}
```

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/d9d4b4f4-8e61-4b0c-8e2e-76f12d3d38aa" />


**Résultat obtenu :**  200 OK - Token généré avec succès

---

## Créer une demande (exemple : retrait Bac)

**Méthode :** `POST`
**URL :** `http://localhost:8000/api/demandes`

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/5b48f925-5650-48fd-b70b-d58060473224" />


**Résultat obtenu :**  201 Created - Demande créée avec statut `en_attente` sans vérification Apogée

---

## Valider une demande - Étudiant TROUVÉ dans Apogée 

**Méthode :** `PUT`
**URL :** `http://localhost:8000/api/demandes/1/valider`
**Auth :** Bearer Token requis

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/18da8182-8208-4790-8b8a-e60372f45fd5" />

**Ce qui se passe en coulisses :**
1. Agent clique sur "Valider"
2. ApogeeService vérifie dans `apoge_simule` si CNE + code_apogee + nom + prenom correspondent
3. Étudiant ZEGOUR Hajar trouvée 
4. Statut mis à jour → `prete`
5. PDF généré automatiquement
6. Email de notification envoyé à `h.zegour9169@uca.ac.ma`

**Réponse attendue (200 OK) :**
```json
{
  "message": "Demande validée avec succès. Document prêt.",
  "demande": {
    "id": 1,
    "statut": "prete",
    "date_traitement": "2026-05-12T...",
    "traite_par": {
      "id": 2,
      "nom": "Alami",
      "prenom": "Fatima",
      "role": "agentScolarite"
    },
    "document": {
      "id": 1,
      "nom": "certificat_scolarite_21001234_XXXXXXXXXX.pdf",
      "chemin_fichier": "documents/certificat_scolarite_21001234_XXXXXXXXXX.pdf",
      "date_generation": "2026-05-12T..."
    }
  }
}
```

**Résultat obtenu :**  200 OK - Statut `prete`, PDF généré, email envoyé

<img width="1190" height="692" alt="image" src="https://github.com/user-attachments/assets/eb38cdcb-ff33-41a4-884f-c5c78bdd58a6" />

---

## Valider une demande - Étudiant NON TROUVÉ dans Apogée 

**Méthode :** `POST` puis `PUT`
**Étape 1 :** Créer une demande avec un faux code apoge

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/e6a2c4f4-3f38-4ded-ac2d-4cc93dd74de1" />


**Étape 2 :** Valider cette demande

**URL :** `http://localhost:8000/api/demandes/{id}/valider`

<img width="1189" height="704" alt="image" src="https://github.com/user-attachments/assets/ee3114cb-9da0-4c85-8247-a2c7f561a9a6" />


**Ce qui se passe en coulisses :**
1. ApogeeService vérifie dans `apoge_simule`
2. `FAUX_code apoge` ne correspond à aucun étudiant 
3. Statut mis à jour → `refusee`
4. Motif de refus enregistré automatiquement
5. Email de refus envoyé

**Réponse attendue (404) :**
```json
{
  "message": "Étudiant non trouvé dans Apogée",
  "demande": {
    "id": 2,
    "statut": "refusee",
    "motif_refus": "Informations incorrectes. Vérifiez votre CNE, code Apogée, nom et prénom."
  }
}
```

**Résultat obtenu :**  404 - Statut `refusee`, motif enregistré, email de refus envoyé


---

## Génération des PDFs 

### Types de documents  és

| Type | PDF généré | Données utilisées |
|------|-----------|-------------------|
| `at ation_inscription` | ✅ | Infos étudiant + filière + année universitaire |
| `certificat_scolarite` | ✅ | Infos étudiant + filière + nbr inscriptions |
| `releve_notes` | ✅ | Notes par semestre + moyenne + résultat |
| `diplome_deust` | ✅ | Toutes notes + toutes moyennes + mention |
| `retrait_bac` | ❌ (voulu) | Aucun PDF - juste une demande administrative |

**Accès au PDF généré :**
```
http://localhost:8000/storage/documents/{nom_du_fichier}.pdf
```

**Résultat obtenu :**  PDFs générés avec en-tête FST Marrakech
Exemple pour une demande de diplome_deust:

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/f69f64ea-0031-47a7-90b2-cbb623f1f9ad" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/197d8336-5053-4f52-bb2a-fa9491cb1ef9" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/901681af-099d-438b-994a-50ce9fa3ff98" />


---

##   Notifications Email 

### Emails envoyés automatiquement

| Événement | Destinataire | Objet |
|-----------|-------------|-------|
| Demande validée (`prete`) | Email de l'étudiant | "Votre document est prêt - Scolarité FST Marrakech" |
| Demande refusée (`refusee`) | Email de l'étudiant | "Votre demande a été refusée - Scolarité FST Marrakech" |

**Configuration SMTP :** Gmail avec mot de passe d'application

---

## Interface Admin

###  Login Admin

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/6624c164-7c52-42bf-85f5-558ea3aca342" />

### Dashboard Admin

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/0cbe3b83-0b61-4ab7-8a49-e14487ca1d67" />

### Liste des utilisateurs

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/d1d3734c-e3c2-4be5-9f73-8dcdccfb1691" />

### Créer un utilisateur

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/f1f363e3-ab5c-4afe-9c36-6f98e9e1d4c4" />

### Désactiver un utilisateur

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/9e067112-7699-466b-9f56-fb30aaa70288" />

### Vérifier que l'utilisateur désactivé ne peut plus se connecter

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/2c83dffb-e660-4c20-aad9-4fad6a64cf5b" />

---

##  Workflow Complet

```
INTERFACE ÉTUDIANTE           API (Laravel)         APOGÉE (MySQL)
      │                             │                          │
      │── POST /api/demandes ──────▶│                          │
      │   (CNE, nom, email, type)   │                          │
      │                             │── INSERT demandes ──────▶│
      │                             │   statut = en_attente    │
      │◀── 201 Created ─────────────│                          │
      │                             │                          │
      │                          AGENT                         │
      │                             │                          │
      │                             │── PUT /valider ─────────▶│
      │                             │                          │
      │                             │── SELECT ETUDIANTS ─────▶│
      │                             │   WHERE CNE + code + nom  │
      │                             │◀── Résultat ─────────────│
      │                             │                          │
      │                             │  Si trouvé:              │
      │                             │  ├── statut = prete      │
      │                             │  ├── Générer PDF         │
      │                             │  └── Email "prêt"        │
      │                             │                          │
      │                             │  Si non trouvé:          │
      │                             │  ├── statut = refusee    │
      │                             │  └── Email "refus"       │
      │                             │                          │
      │◀── Email notification ──────│                          │
```

---

##  Structure du Projet

### Backend (Laravel 11)

```
backend/
├── app/
│   ├── Http/Controllers/Api/
│   │   ├── AuthController.php      # Login, Register, Logout, Me
│   │   └── DemandeController.php   # CRUD + Valider + Statistiques
│   ├── Models/
│   │   ├── Demande.php
│   │   ├── DocumentDemande.php
│   │   └── User.php
│   ├── Services/
│   │   ├── ApogeeService.php       # Connexion base Apogée
│   │   └── PdfService.php          # Génération PDF
│   └── Mail/
│       ├── DocumentPretMail.php
│       └── DemandeRefuseeMail.php
├── resources/views/
│   ├── pdf/                        # Templates PDF (Blade)
│   │   ├── at ation_inscription.blade.php
│   │   ├── certificat_scolarite.blade.php
│   │   ├── releve_notes.blade.php
│   │   └── diplome_deust.blade.php
│   └── emails/                     # Templates emails (Blade)
│       ├── document_pret.blade.php
│       └── demande_refusee.blade.php
└── routes/
    └── api.php
```


##  Technologies Utilisées

| Technologie | Version | Rôle |
|-------------|---------|------|
| Laravel | 11 | Backend API REST |
| React | 18 | Frontend Dashboard |
| Vite | 5 | Build tool Frontend |
| MySQL | 8 | Base de données |
| Sanctum | 4 | Authentification API |
| DomPDF | 3 | Génération PDF |
| Recharts | 2 | Graphiques Dashboard |
| React Router | 6 | Navigation Frontend |

---
