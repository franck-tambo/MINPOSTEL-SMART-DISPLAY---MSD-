# 🏛️ MINPOSTEL Smart Display (MSD)

<div align="center">

![Cameroon Flag](https://img.shields.io/badge/Cameroon-MINPOSTEL-007A3D?style=for-the-badge&logo=flag&logoColor=yellow)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Bilingual](https://img.shields.io/badge/Language-FR%20%7C%20EN-orange?style=for-the-badge)

<br/>

**Système centralisé de gestion et d'affichage en temps réel pour les écrans de MINPOSTEL.**  
*Centralized real-time management and digital signage system for MINPOSTEL screens.*

[Aperçu Fonctionnel](#-aperçu-du-projet) •
[Architecture](#-architecture-technique) •
[Fonctionnalités](#-fonctionnalités-clés) •
[Installation Rapide](#-démarrage-rapide) •
[Documentation & Diagrammes](#-dossier-technique--diagrammes)

---

</div>

## 📌 Aperçu du Projet / Overview

**MINPOSTEL Smart Display (MSD)** est une solution numérique d'affichage dynamique conçue et développée pour moderniser la communication institutionnelle, la diffusion d'annonces officielles et l'orientation des usagers au sein du **Ministère des Postes et Télécommunications du Cameroun (MINPOSTEL)**.

Le système remplace l'affichage papier traditionnel par un réseau d'écrans intelligents interactifs, synchronisés en temps réel et pilotés depuis une console d'administration sécurisée.

---

## 🚀 Fonctionnalités Clés / Key Features

### 🖥️ 1. Affichage Public Intelligent (Smart TV / Kiosk Display)
- **Bilinguisme Automatique (FR / EN) :** Bascule cyclique et fluide entre le Français et l'Anglais sans rechargement de page.
- **Synchronisation Instantanée (Socket.IO) :** Tout changement validé par un administrateur apparaît immédiatement sur l'écran d'accueil sans latence.
- **Diffusions d'Urgences (Breaking Alerts) :** Bannière d'alerte prioritaire avec signal sonore d'attention et lecture automatique.
- **Orientation Interactive par QR Code :** Les usagers scannent le QR code affiché à l'écran pour emporter le guide d'orientation interactif sur leur propre smartphone.
- **Widgets Dynamiques Intégrés :** Horloge temps réel, date bilingue et bulletin météo local (Yaoundé).

### 🛠️ 2. Tableau de Bord d'Administration (Admin Dashboard)
- **Gestion des Contenus :** Création, modération et planification des annonces (`📢`), réunions du jour (`📅`), événements (`🎉`), communications (`📰`) et alertes urgentes (`🚨`).
- **Médiathèque Institutionnelle :** Téléversement, prévisualisation et gestion des visuels, affiches et logos officiels.
- **Gestion du Parc d'Écrans & Emplacements :** Surveillance de l'état en ligne/hors-ligne des écrans connectés (Heartbeat télémétrique).
- **Audit & Sécurité :** Journalisation complète des actions administratives (Activity Logs), authentification JWT avec chiffrement des mots de passe.

### 📱 3. Guide d'Orientation Mobile Visiteur (Mobile Visitor Portal)
- Accessible directement via le QR Code de l'écran ou par lien web.
- Fonctionne sur le réseau local Wi-Fi du ministère et à distance via tunnel Cloudflare sécurisé.
- Annuaire des directions, divisions, salles de réunions et services aux usagers avec guidage pas à pas.

---

## 🏗️ Architecture Technique / Technical Architecture

```
                               ┌─────────────────────────────────┐
                               │   Tableau de Bord Admin         │
                               │   (Navigateur Web - React 18)   │
                               └────────────────┬────────────────┘
                                                │ REST API / JWT
                                                ▼
┌─────────────────────────────────┐    ┌─────────────────────────────────┐
│   Écran Public d'Accueil        │◄───┤   Serveur Backend Node.js       │
│   (Smart TV / Kiosk Display)    │ WSS│   (Express + Socket.IO Engine)  │
└─────────────────────────────────┘    └────────────────┬────────────────┘
                                                        │
           ┌────────────────────────────────────────────┼───────────────────────────┐
           │                                            │                           │
           ▼                                            ▼                           ▼
┌────────────────────────┐                   ┌────────────────────┐     ┌──────────────────────┐
│  Passerelle Cloudflare │                   │ Stockage Hybride   │     │  Médiathèque         │
│  (Tunnel HTTPS Mobile) │                   │ Supabase / JSON DB │     │  Uploads & Assets    │
└──────────┬─────────────┘                   └────────────────────┘     └──────────────────────┘
           │
           ▼
┌────────────────────────┐
│  Mobile Visiteur       │
│  (Smartphones usagers) │
└────────────────────────┘
```

### 💻 Stack Technologique :
- **Frontend :** React 18, Vite, Lucide Icons, Vanilla CSS3 (Design System haute fidélité aux couleurs du Cameroun et du MINPOSTEL).
- **Backend :** Node.js, Express.js, Socket.IO (WebSockets), JWT, Bcrypt.
- **Base de Données & Persistance :** PostgreSQL / Supabase, MySQL (`mysql2`), avec moteur de persistance local résilient (`msd_store.json`).
- **Passerelle Réseau :** Démon Cloudflare Tunnel (`cloudflared`) pour l'accès cellulaire 4G/5G sécurisé sans ouverture de port entrant.

---

## ⚡ Démarrage Rapide / Quick Start

### Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure)
- Git

### 1. Cloner le Répertoire
```bash
git clone https://github.com/franck-tambo/MINPOSTEL-SMART-DISPLAY---MSD-.git
cd MINPOSTEL-SMART-DISPLAY---MSD-
```

### 2. Démarrage en 1 Clic (Sous Windows)
Un script de lancement tout-en-un est inclus à la racine du projet :
```cmd
Double-cliquez sur LANCER_LE_PROJET.bat
```
*Ce script installe les dépendances nécessaires, démarre le backend (Port 5000), le frontend (Port 5173), et ouvre automatiquement votre navigateur.*

### 3. Démarrage Manuel (Ligne de commande)

#### Backend :
```bash
cd minpostel-smart-display/server
npm install
npm run dev
```

#### Frontend :
```bash
cd minpostel-smart-display/client
npm install
npm run dev
```

### 🌐 Adresses par Défaut :
| Service | URL |
| :--- | :--- |
| **Console d'Administration** | `http://localhost:5173` |
| **Écran d'Affichage Public** | `http://localhost:5173/display/MINPOSTEL-MAIN-ENTRANCE-01` |
| **Guide Mobile Visiteur** | `http://localhost:5173/visitor` |
| **API Backend REST** | `http://localhost:5000/api` |

---

## 📂 Structure du Projet / Directory Structure

```plaintext
MINPOSTEL SMART DISPLAY (MSD)/
├── LANCER_LE_PROJET.bat            # Script de lancement automatique en 1 clic
├── PUSH_TO_GITHUB.bat              # Script d'envoi et synchronisation GitHub
├── README.md                       # Documentation générale du projet
├── docs/                           # Documentation technique & rapport de stage
│   ├── PROJECT_SUMMARY.md          # Synthèse technique & guide pour le mémoire
│   ├── ARCHITECTURE_AND_DESIGN.md  # Spécification détaillée de conception logicielle
│   └── diagrams/                   # Diagrammes techniques source Mermaid (.mmd)
│       ├── view_diagrams.html      # Visualiseur web interactif des 11 diagrammes
│       ├── 01_problem_solution_context.mmd
│       ├── 02_use_case_diagram.mmd
│       ├── 03_system_architecture_c4.mmd
│       ├── 04_entity_relationship_diagram.mmd
│       ├── 05_sequence_urgent_broadcast.mmd
│       ├── 06_sequence_playlist_and_language.mmd
│       ├── 07_sequence_visitor_qr_navigation.mmd
│       ├── 08_sequence_display_heartbeat.mmd
│       ├── 09_state_machine_display_screen.mmd
│       ├── 10_state_machine_content_lifecycle.mmd
│       └── 11_physical_deployment_diagram.mmd
└── minpostel-smart-display/
    ├── client/                     # Application Frontend React 18 + Vite
    │   ├── src/
    │   │   ├── components/         # Composants réutilisables (Emblème, widgets, etc.)
    │   │   ├── context/            # Contextes React (Auth, Langue, Thème)
    │   │   ├── pages/              # Pages (Admin, Affichage Public, Visiteur Mobile)
    │   │   └── styles/             # Feuilles de styles CSS personnalisées
    │   └── package.json
    └── server/                     # Application Backend Node.js + Express
        ├── src/
        │   ├── controllers/        # Contrôleurs API REST
        │   ├── middleware/         # Authentification JWT, gestion d'erreurs
        │   ├── routes/             # Définition des points d'accès API
        │   ├── sockets/            # Gestionnaire WebSocket en temps réel
        │   └── services/           # Service météo, tunnel Cloudflare, veille écran
        └── package.json
```

---

## 📊 Dossier Technique & Diagrammes / Documentation

Le projet inclut un dossier complet d'ingénierie logicielle conçu pour la soutenance de stage et les revues techniques :

1. **[Dossier de Synthèse Technique](docs/PROJECT_SUMMARY.md) :** Présentation du problème, de la solution, des objectifs pédagogiques et du guide de rédaction.
2. **[Architecture & Conception Logicielle](docs/ARCHITECTURE_AND_DESIGN.md) :** Description détaillée des 11 diagrammes de conception (C4, UML, Merise, Séquences).
3. **[Visualiseur Interactif de Diagrammes](docs/diagrams/view_diagrams.html) :** Ouvrez simplement ce fichier dans un navigateur pour afficher et inspecter tous les diagrammes avec zoom et export SVG/PNG.

---

## 🏛️ Contexte Institutionnel

Ce projet a été réalisé au sein du :
- **Organisme d'accueil :** Ministère des Postes et Télécommunications de la République du Cameroun (MINPOSTEL).
- **Projet :** Système d'Affichage Dynamique et Intelligent du Hall d'Accueil Principal.
- **Devise :** *Paix — Travail — Patrie / Peace — Work — Fatherland*

---

## 📄 Licence & Droits

Projet développé dans le cadre des activités d'ingénierie logicielle pour le **MINPOSTEL**.  
Tous droits réservés © 2026.
