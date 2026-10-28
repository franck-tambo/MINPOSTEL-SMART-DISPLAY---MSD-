# DOSSIER DE SYNTHÈSE TECHNIQUE & GUIDE DE RÉDACTION DU RAPPORT DE STAGE
# PROJET : MINPOSTEL SMART DISPLAY (MSD)

> **Document de Référence pour :**
> - La rédaction complète du Rapport de Stage / Mémoire de Fin d'Études.
> - La conception, le traçage et l'explication de tous les diagrammes techniques (UML, C4, Merise/ERD, Déploiement).
> - La préparation du support de soutenance orale devant le tuteur et le jury académique.

---

## FICHE SIGNALÉTIQUE DU PROJET

| Rubrique | Détail |
| :--- | :--- |
| **Intitulé du Projet** | Conception et réalisation d'un système intelligent de gestion et d'affichage dynamique des informations au sein du Ministère des Postes et Télécommunications (MINPOSTEL). |
| **Nom de Code** | **MSD** (MINPOSTEL Smart Display) |
| **Organisme d'Accueil** | Ministère des Postes et Télécommunications du Cameroun (Yaoundé) |
| **Cible Opérationnelle** | Hall d'entrée principal (Rez-de-chaussée), Salles de conférence, Usagers et Délégations officielles |
| **Type d'Application** | Plateforme Web Temps Réel & Affichage Kiosque Haute Disponibilité (Digital Signage) |
| **Stack Technologique** | React 18, Vite, Node.js, Express.js, Socket.IO, PostgreSQL (Supabase), MySQL 8+, Cloudflare Tunnel |
| **Spécificités Majeures** | Bilinguisme automatique (FR/EN), Tolérance aux pannes 100% hors-ligne, Alertes de crise <50ms, Guidage mobile par QR Code sans installation d'application. |

---

## TABLE DES MATIÈRES

1. **Chapitre 1 : Introduction Générale, Contexte & Problématique**
   - 1.1 Présentation de l'organisme d'accueil (MINPOSTEL)
   - 1.2 Contexte du stage et motivation
   - 1.3 Analyse critique de l'existant & Énoncé du problème
   - 1.4 Objectifs généraux et spécifiques de la solution
2. **Chapitre 2 : Analyse des Besoins & Modélisation Fonctionnelle**
   - 2.1 Typologie des acteurs du système
   - 2.2 Spécification détaillée des besoins fonctionnels
   - 2.3 Spécification des exigences non-fonctionnelles
   - 2.4 Matrice de traçabilité des cas d'utilisation
3. **Chapitre 3 : Architecture Logicielle & Choix Technologiques**
   - 3.1 Architecture multi-tiers (Modèle C4 Container)
   - 3.2 Justification scientifique et technique des technologies retenues
   - 3.3 Mécanisme de résilience hybride et tolérance aux pannes
   - 3.4 Sécurité, contrôle d'accès et auditabilité
4. **Chapitre 4 : Modélisation des Données (Dictionnaire & Relations)**
   - 4.1 Description des entités métier
   - 4.2 Dictionnaire détaillé des données et contraintes
   - 4.3 Relations, cardinalités et règles de gestion
5. **Chapitre 5 : Dynamiques du Système & Processus Temps Réel**
   - 5.1 Protocole de diffusion d'urgence ministérielle
   - 5.2 Algorithme de carrousel et alternance bilingue
   - 5.3 Passerelle d'orientation mobile par QR Code (Physical-to-Digital Handover)
   - 5.4 Protocole de battement de cœur (Heartbeat) et télémétrie
   - 5.5 Cycle de vie opérationnel de l'écran et gestion éco-énergétique
6. **Chapitre 6 : Déploiement Physique & Topologie Réseau**
   - 6.1 Implantation matérielle au siège du MINPOSTEL
   - 6.2 Routage réseau local vs accès cellulaire distant
7. **Chapitre 7 : Guide Pratique pour Dessiner vos Diagrammes**
   - 7.1 Guide pour le Diagramme de Contexte
   - 7.2 Guide pour le Diagramme des Cas d'Utilisation (UML)
   - 7.3 Guide pour le Diagramme de Classes / ERD
   - 7.4 Guide pour les Diagrammes de Séquence
   - 7.5 Guide pour les Diagrammes d'États-Transitions
8. **Chapitre 8 : Arguments Clés pour la Soutenance devant le Jury**

---

# CHAPITRE 1 : INTRODUCTION GÉNÉRALE, CONTEXTE & PROBLÉMATIQUE

### 1.1 Présentation de l'Organisme d'Accueil
Le **Ministère des Postes et Télécommunications (MINPOSTEL)** est le département ministériel du gouvernement de la République du Cameroun responsable de :
- L'élaboration, la mise en œuvre et l'évaluation de la politique nationale en matière de postes, de télécommunications et des Technologies de l'Information et de la Communication (TIC).
- La supervision des organes sous tutelle (ART, CAMPOST, ANTIC, SUP'PTIC).
- La promotion de l'économie numérique, de la gouvernance électronique et de la cybersécurité sur le territoire national.

Le bâtiment central abrite le Cabinet de Madame le Ministre, le Secrétariat Général, ainsi que plusieurs directions opérationnelles, divisions et salles de réunion accueillant quotidiennement des commissions d'experts nationaux et internationaux.

### 1.2 Contexte du Stage
Le stage s'inscrit dans le cadre de la modernisation des services de communication interne et d'accueil public du MINPOSTEL, conformément à la stratégie gouvernementale de transition numérique des administrations publiques camerounaises.

### 1.3 Analyse Critique de l'Existant (La Problématique)
Avant l'implémentation de la solution **MSD**, l'information au sein du hall d'accueil reposait sur des processus traditionnels :
1. **L'affichage papier prédominant :** Les communiqués, arrêtés et convocations de réunions étaient imprimés puis punaisés sur des panneaux en liège. Les affiches se détérioraient rapidement, perdaient leur lisibilité et surchargeaient visuellement l'espace d'accueil.
2. **La désorientation chronique des visiteurs :** Le complexe ministériel compte plusieurs bâtiments (Bâtiment Principal, Bâtiment Annexe) répartis sur plusieurs étages. Les usagers et délégations devaient systématiquement solliciter les agents du poste de garde ou de la réception pour localiser leur salle, générant des files d'attente et des retards en commission.
3. **L'incapacité de diffusion de crise en temps réel :** En cas d'événement imprévu (alerte de sécurité, délocalisation de salle, note d'urgence ministérielle), il était impossible de prévenir instantanément les personnes présentes dans le hall d'entrée. Le temps de transmission d'une consigne prenait entre 15 et 45 minutes par porteur de note physique.
4. **La barrière linguistique :** Le Cameroun étant un pays officiellement bilingue (Français et Anglais), l'affichage physique imposait de dédoubler manuellement chaque affiche, consommant du papier et réduisant l'espace disponible.
5. **La rupture numérique :** Le visiteur qui lisait une information au rez-de-chaussée devait mémoriser les horaires et la salle, ou prendre une photo avec son téléphone, sans possibilité d'emporter avec lui une fiche interactive géolocalisée.

### 1.4 Objectifs du Système Proposé (MINPOSTEL Smart Display)
Le projet MSD a pour ambition de concevoir un système complet composé d'un **panneau d'administration web sécurisé**, d'un **écran d'affichage numérique haute définition 16:9** installé dans le hall d'entrée, et d'un **guide d'orientation mobile** accessible via QR Code.

Les objectifs spécifiques sont :
- **Digitaliser 100% de la communication physique** du hall d'accueil.
- **Réduire le temps de diffusion d'urgence à moins de 1 seconde** via une architecture WebSockets.
- **Assurer un bilinguisme strict (50% FR / 50% EN)** avec alternance temporelle automatique.
- **Fournir une passerelle mobile "Zero-Install"** permettant aux usagers de scanner un QR Code pour guider leurs pas jusqu'à la salle de réunion.
- **Garantir une tolérance totale aux pannes d'Internet** grâce à un moteur de cache local autonome.

---

# CHAPITRE 2 : ANALYSE DES BESOINS & MODÉLISATION FONCTIONNELLE

### 2.1 Les Acteurs du Système
L'analyse UML identifie 4 acteurs majeurs :
1. **Administrateur Principal (Super Admin) :**  
   Agent de la Direction des Systèmes d'Information (DSI) ou chef de cellule. Il configure le système, gère les comptes utilisateurs, consulte les journaux d'audit de sécurité, pilote les plages horaires de veille/réveil et déclenche les alertes ministérielles de crise.
2. **Gestionnaire de Contenu (Content Manager) :**  
   Agent de la Cellule de Communication (CELCOM). Il crée, valide, programme et supprime les annonces, réunions du jour, événements ministériels et avis au personnel.
3. **Visiteur / Usager Public :**  
   Toute personne présente physiquement dans le hall d'entrée du ministère. Il lit l'écran 16:9 sans interagir physiquement avec celui-ci, puis utilise son smartphone personnel pour flasher les QR Codes et naviguer sur le guide mobile.
4. **Écran Kiosque Entrée (Acteur Système Matériel) :**  
   Dispositif autonome (Smart TV / Kiosque d'affichage 55-65 pouces). Il s'initialise seul, transmet des pulsations de santé (heartbeats) toutes les 15 secondes au serveur, bascule automatiquement de langue et affiche les alertes prioritaires.

### 2.2 Besoins Fonctionnels Détaillés
Le système est segmenté en 6 modules fonctionnels :

#### Module 1 : Authentification & Sécurité
- Authentification sécurisée par identifiant/mot de passe avec hachage Bcrypt.
- Gestion de session par jeton JWT stocké dans un cookie `HttpOnly` sécurisé.
- Traçabilité totale : Enregistrement de chaque action (connexion, création, modification, suppression, alerte) dans la table `activity_logs` avec horodatage et adresse IP.

#### Module 2 : Gestion Éditoriale Multilingue
- Création d'annonces institutionnelles avec titre et description obligatoires en français ET en anglais.
- Programmation calendaire : Date de début, date de fin, heure de début et heure de fin.
- Affectation d'un niveau de priorité : `NORMAL`, `IMPORTANT`, `URGENT`.
- Gestion des états : `DRAFT` (Brouillon), `SCHEDULED` (Programmé), `PUBLISHED` (En diffusion), `EXPIRED` (Archivé).
- Médiathèque intégrée : Téléversement et compression d'affiches, logos et visuels de support (JPG, PNG, WebP).

#### Module 3 : Gestion Spatiale des Réunions et Événements
- Enregistrement des réunions du Cabinet et des événements ministériels.
- Association stricte avec l'infrastructure du ministère : Choix du bâtiment (`MAIN_BLDG`, `ANNEX_BLDG`), de l'étage (`RDC`, `1er`, `2e`, etc.) et de la salle (`CONF-B`, `AUDIT-A`).
- Indication du nombre de participants, de l'organisateur et de la capacité de la salle.

#### Module 4 : Moteur d'Affichage Dynamique Kiosque
- Interface adaptée aux écrans panoramiques 16:9 Full HD et 4K.
- Rotation automatique des diapositives avec barre de progression temporelle animée (10 à 20 secondes par diapositive).
- Alternance bilingue intelligente : Lorsque le carrousel termine une boucle complète (retour à l'index 0), la langue d'affichage permute automatiquement (`FR` vers `EN` ou `EN` vers `FR`).
- Horloge numérique en direct synchronisée sur le fuseau horaire de Yaoundé (GMT+1).
- Widget météo temps réel (température, humidité, icône météo de Yaoundé).
- Bandeau déroulant d'information continue (*Ticker*) en bas d'écran.
- Génération instantanée d'un QR Code vectoriel unique pour chaque réunion et événement affiché.

#### Module 5 : Système de Gestion de Crise & Alertes d'Urgence
- Déclenchement d'une alerte prioritaire immédiate par le Super Admin en 2 clics.
- Suspension instantanée de la rotation normale des diapositives sans rafraîchissement d'écran.
- Affichage d'un bandeau rouge clignotant haute visibilité sur 100% de la largeur de l'écran.
- Émission d'un signal sonore d'attention via l'API Web Audio du navigateur.
- Mémorisation de la durée exacte de diffusion dans l'historique de crise.
- Reprise fluide et automatique du carrousel normal dès que l'administrateur clique sur "Arrêter l'alerte".

#### Module 6 : Passerelle Visiteur Mobile (Orientation sans installation)
- Scan du QR Code sur l'écran par l'usager avec son smartphone personnel.
- Affichage instantané d'une page mobile ergonomique indiquant :
  - L'intitulé de la réunion en version bilingue.
  - L'itinéraire complet dans le ministère : *Nom du Bâtiment ➔ Étage ➔ Numéro et nom de la salle*.
  - Les horaires de début et de fin.
  - La capacité de la salle et les informations d'accès.
- Accès transparent que le visiteur soit connecté au Wi-Fi du ministère ou sur ses propres données mobiles (4G/5G).

#### Module 7 : Télémétrie Matérielle & Éco-Énergie
- Protocole de pulsation (Heartbeat) émis par l'écran toutes les 15 secondes.
- Détection automatique de panne matérielle ou déconnexion réseau si aucun ping n'est reçu après 45 secondes, avec bascule du badge en rouge (`OFFLINE`) sur le panneau d'administration.
- Mise en veille écologique programmée (par exemple écran noir entre 18h00 et 07h00) pour préserver la dalle d'affichage et économiser l'énergie du bâtiment.

### 2.3 Exigences Non-Fonctionnelles
- **Temps de Réponse & Latence :** La propagation d'une alerte ou d'un nouveau contenu vers l'écran doit s'exécuter en moins de **50 millisecondes** via WebSockets.
- **Disponibilité & Résilience :** Le système doit atteindre un taux de disponibilité de **99,9%**. En cas de rupture du réseau Internet ou de coupure de la base de données distante, l'écran doit continuer de diffuser les contenus sans écran blanc ni crash.
- **Compatibilité Matérielle :** Fonctionnement direct sur navigateurs intégrés Smart TV (Samsung Tizen, LG webOS, Android TV, Sony, Hisense) sans nécessiter de matériel additionnel coûteux.
- **Sécurité :** Chiffrement des mots de passe en Bcrypt (coût 10), validation stricte des entrées pour prévenir les injections SQL et XSS, politique de CORS restreinte.
- **Accessibilité & Ergonomie :** Typographie lisible à plus de 5 mètres de distance (familles de polices Inter et Outfit), contrastes respectant les normes WCAG AA.

---

# CHAPITRE 3 : ARCHITECTURE LOGICIELLE & CHOIX TECHNIQUES

### 3.1 Architecture Multi-Tiers (Modèle C4 Container)
Le système repose sur un modèle à 4 couches indépendantes et modulaires :

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. COUCHE PRÉSENTATION (React 18 + Vite SPA)                            │
│    [ Admin Dashboard ]    [ Public Kiosk Screen ]   [ Mobile Visitor ] │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ HTTP REST / WebSocket (Socket.IO)
┌────────────────────────────────────▼───────────────────────────────────┐
│ 2. COUCHE PASSERELLE & TRANSPORT (Réseau & Sécurité)                  │
│    [ Réseau Local LAN / Wi-Fi ]   [ Cloudflare Tunnel HTTPS (4G/5G) ]  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ Requêtes API / Événements push
┌────────────────────────────────────▼───────────────────────────────────┐
│ 3. COUCHE APPLICATION & MÉTIER (Node.js + Express.js)                  │
│    • Contrôleurs RESTful (Auth, Feed, Annonces, Réunions, Urgences)    │
│    • Moteur Temps Réel Socket.IO (Gestionnaire de canaux et rooms)     │
│    • Daemons : Heartbeat Monitor (15s) & Power Management Service      │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ Driver Polyvalent & Fallback
┌────────────────────────────────────▼───────────────────────────────────┐
│ 4. COUCHE DONNÉES & PERSISTANCE (Architecture Hybride Tolérante)       │
│    [ PostgreSQL (Supabase) ]  ou  [ MySQL 8.0+ ]  ==> [ msd_store.json ]│
│    [ Système de fichiers local /uploads pour les médias ]              │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Justification des Choix Technologiques

| Composant | Technologie | Justification Technique pour le Rapport |
| :--- | :--- | :--- |
| **Frontend** | **React 18 & Vite** | Vite offre un temps de compilation ultra-rapide (HMR <100ms). React 18 permet un rendu réactif basé sur les composants et des animations CSS fluides à 60 FPS sans ralentissement sur processeur de télévision. |
| **Icônes & UI** | **Lucide React & Vanilla CSS** | Pas de surcharge Tailwind. Utilisation d'un système de design CSS pur avec variables personnalisées (`--primary`, `--accent`), garantissant un contrôle au pixel près et une empreinte mémoire minimale (<35 Ko de CSS). |
| **Backend API** | **Node.js (v18+) & Express.js** | Modèle asynchrone non bloquant par boucle d'événements (*Event Loop*), idéal pour absorber de nombreuses connexions concurrentes (écrans multiples et usagers scannant les QR codes). |
| **Temps Réel** | **Socket.IO (WebSockets)** | Permet la communication bidirectionnelle permanente. Si l'administrateur valide une urgence, un paquet binaire est poussé instantanément aux écrans, éliminant tout besoin de requêtage périodique (*polling*) qui saturerait le réseau du ministère. |
| **Base de Données Principale** | **PostgreSQL (Supabase) & MySQL** | Modèle relationnel robuste assurant l'intégrité référentielle par clés étrangères (`ON DELETE CASCADE / RESTRICT`). Le driver d'accès unifié bascule automatiquement selon les variables d'environnement. |
| **Moteur de Secours** | **Moteur Local JSON Atomique (`store.util.js`)** | En cas de déconnexion du serveur de base de données, le backend continue de lire et d'écrire dans la mémoire vive avec synchronisation asynchrone sur `msd_store.json`. **Aucun écran noir en cas de panne réseau.** |
| **Tunnel Public** | **Cloudflare Tunnel (`cloudflared`)** | Établit un tunnel sécurisé sortant TLS vers le réseau Cloudflare. Permet à un visiteur en 4G/5G d'accéder au serveur local du ministère sans nécessiter une adresse IP publique fixe ni ouvrir de ports dangereux sur le pare-feu ministériel. |

---

# CHAPITRE 4 : MODÉLISATION DES DONNÉES

### 4.1 Description des Entités Métier
Le schéma relationnel est constitué de **14 tables** conçues avec une normalisation en 3e forme normale (3FN) :

1. **`roles` :** Définit les niveaux de privilèges (`SUPER_ADMIN`, `CONTENT_MANAGER`).
2. **`users` :** Comptes administratifs avec mots de passe chiffrés et suivi de la dernière connexion.
3. **`buildings` :** Bâtiments du ministère (`MAIN_BLDG` : Bâtiment Principal, `ANNEX_BLDG` : Annexe).
4. **`floors` :** Étages rattachés à un bâtiment (du RDC au 4e étage).
5. **`rooms` :** Salles de conférences, amphithéâtres et bureaux d'accueil avec leur capacité.
6. **`display_screens` :** Inventaire des écrans physiques du ministère avec état de santé et adresse IP.
7. **`media` :** Fichiers multimédias téléversés (affiches, arrêtés numérisés, photos officielles).
8. **`announcements` :** Annonces institutionnelles bilingues avec statut et priorité.
9. **`meetings` :** Réunions officielles du Cabinet et des commissions avec liaison spatiale précise.
10. **`events` :** Ateliers nationaux, séminaires et cérémonies officielles du ministère.
11. **`staff_communications` :** Notes internes et communications destinées aux agents du ministère.
12. **`urgent_messages` :** Messages d'alerte critique avec traçabilité des heures de début et fin.
13. **`activity_logs` :** Piste d'audit de sécurité enregistrant chaque opération administrative.
14. **`system_settings` :** Paires clé/valeur des paramètres globaux (durée des diapositives, URL publique, horaires d'alimentation).

### 4.2 Dictionnaire des Données Clés

```
========================================================================================
TABLE: meetings (Réunions Ministérielles & Commissions)
========================================================================================
Champ              Type           Null?   Clé    Description
----------------------------------------------------------------------------------------
id                 INT            NON     PK     Identifiant unique auto-incrémenté
title_fr           VARCHAR(255)   NON            Titre de la réunion en français
title_en           VARCHAR(255)   NON            Titre de la réunion en anglais
description_fr     TEXT           OUI            Ordre du jour / détails en français
description_en     TEXT           OUI            Ordre du jour / détails en anglais
date               DATE           NON     IDX    Date de tenue de la réunion
start_time         TIME           NON     IDX    Heure de début (ex: 14:00:00)
end_time           TIME           NON     IDX    Heure de fin (ex: 16:00:00)
building_id        INT            NON     FK     Référence vers table buildings(id)
floor_id           INT            NON     FK     Référence vers table floors(id)
room_id            INT            NON     FK     Référence vers table rooms(id)
participants_info  TEXT           OUI            Public cible / membres convoqués
priority           ENUM           NON            'NORMAL', 'IMPORTANT', 'URGENT'
status             ENUM           NON     IDX    'SCHEDULED', 'UPCOMING', 'IN_PROGRESS', 'COMPLETED'
is_published       TINYINT(1)     NON            1 = Visible à l'écran, 0 = Masqué
media_id           INT            OUI     FK     Affiche associée dans table media(id)
created_by         INT            NON     FK     Agent créateur dans table users(id)
created_at         TIMESTAMP      NON            Date et heure de création système
updated_at         TIMESTAMP      NON            Date de dernière modification
========================================================================================
```

---

# CHAPITRE 5 : DYNAMIQUES DU SYSTÈME & PROCESSUS TEMPS RÉEL

### 5.1 Protocole de Diffusion d'Urgence Ministérielle
Le processus garantit qu'en cas de sinistre ou d'ordre impératif du Ministre, l'affichage public est réquisitionné instantanément :

1. Le Super Admin se connecte au panneau d'administration (`/dashboard/urgent-messages`).
2. Il rédige le message en français et en anglais, choisit la sévérité `CRITIQUE`, puis valide.
3. Le navigateur envoie une requête `POST /api/urgent-messages/broadcast`.
4. Le contrôleur API vérifie le jeton JWT, enregistre le message en base, consigne l'action dans les journaux d'audit et émet l'événement WebSocket :
   ```javascript
   io.emit('URGENT_MESSAGE_BROADCAST', urgentMessageData);
   ```
5. L'application kiosque connectée capte le signal sans recharger la page :
   - Le carrousel normal est immédiatement suspendu (*freeze*).
   - Un conteneur d'alerte rouge clignotant plein écran recouvre la scène.
   - Un bip d'avertissement sonore est généré via l'API Web Audio.
   - Le message défile dans le bandeau inférieur.
6. Lorsque l'alerte prend fin, l'administrateur clique sur "Arrêter l'alerte" :
   - Le serveur met à jour `stopped_at`, calcule la durée totale de diffusion et émet `URGENT_MESSAGE_STOPPED`.
   - L'écran kiosque retire le bandeau rouge et reprend la rotation à la diapositive exacte où il avait été interrompu.

### 5.2 Algorithme de Carrousel & Alternance Bilingue
Le composant `PublicDisplayPage.jsx` implémente une boucle autonome résiliente :

```
             ┌────────────────────────────────────────┐
             │       Écran allumé & Connecté          │
             └───────────────────┬────────────────────┘
                                 │
                     ┌───────────▼───────────┐
                     │   Langue Initiale: FR │
                     │   Diapositive Index: 0│
                     └───────────┬───────────┘
                                 │
             ┌───────────────────▼────────────────────┐
             │  Animation de la Barre de Progression  │
             │       (Durée: N secondes, ex: 15s)     │
             └───────────────────┬────────────────────┘
                                 │ Fin du timer (15s)
                     ┌───────────▼───────────┐
                     │ Index = (Index + 1)   │
                     └───────────┬───────────┘
                                 │
                     /───────────────────────\
                    <  Index == 0 (Boucle ??) >
                     \───────────────────────/
                       │ OUI               │ NON
                       ▼                   ▼
            ┌──────────────────────┐  ┌──────────────────────┐
            │ Bascule de Langue :  │  │ Conserve la Langue   │
            │ FR -> EN  ou EN -> FR│  │ Actuelle             │
            └──────────┬───────────┘  └──────────┬───────────┘
                       │                         │
                       └─────────────┬───────────┘
                                     │
                     ┌───────────────▼───────────────┐
                     │  Génère le QR Code vectoriel  │
                     │  Météo & Heure Yaoundé mises  │
                     │  à jour en continu            │
                     └───────────────┬───────────────┘
                                     │
                                     └───► (Repart pour la diapositive suivante)
```

### 5.3 Passerelle d'Orientation Mobile par QR Code (Physical-to-Digital Handover)
1. L'écran de hall affiche une réunion : *"Atelier National sur la Cybersécurité - Salle Polyvalente"*.
2. Le composant React génère un QR Code SVG contenant l'URL résolue :
   - *Sur Wi-Fi local :* `http://10.196.131.76:5173/visitor/meeting/1`
   - *Sur données mobiles 4G/5G :* `https://[subdomain].trycloudflare.com/visitor/meeting/1`
3. L'usager pointe l'appareil photo de son smartphone (iOS ou Android).
4. Le navigateur du smartphone s'ouvre sur la page `MobileVisitorPage.jsx` sans qu'aucune application n'ait été téléchargée.
5. Le visiteur lit l'itinéraire précis : **Bâtiment Principal ➔ Rez-de-Chaussée ➔ Salle Polyvalente**, avec les horaires et les détails des intervenants.

### 5.4 Protocole de Battement de Cœur (Heartbeat) & Télémétrie
1. L'écran physique émet un événement socket `DISPLAY_HEARTBEAT` toutes les 15 secondes.
2. Le serveur maintient en mémoire vive une table de hachage `screenStatusMap` stockant :
   - L'identifiant de l'écran (`MINPOSTEL-MAIN-ENTRANCE-01`).
   - L'adresse IP de la télévision.
   - L'horodatage exact de la dernière réception.
3. Un démon d'arrière-plan s'exécute sur le serveur toutes les 15 secondes :
   - Il calcule `diffSeconds = (Now - lastHeartbeat)`.
   - Si `diffSeconds > 45 secondes` (absence de 3 pings consécutifs suite à coupure d'alimentation ou déconnexion Wi-Fi), le serveur marque l'écran comme `OFFLINE` et émet `DISPLAY_STATUS_UPDATE`.
   - Le badge de l'écran sur le tableau de bord de l'administrateur passe instantanément du **VERT** au **ROUGE**, permettant à la DSI d'intervenir sans attendre qu'un usager ne signale la panne.

---

# CHAPITRE 6 : DÉPLOIEMENT PHYSIQUE & TOPOLOGIE RÉSEAU

### 6.1 Implantation dans l'Enceinte du MINPOSTEL
L'infrastructure s'articule autour de 3 zones géographiques :
1. **Zone Publique (Hall d'Accueil RDC) :**  
   - Écran Smart TV LED 55'' ou 65'' fixé au mur face aux portes vitrées d'entrée.
   - Connecté soit par câble HDMI direct à l'unité centrale, soit connecté au Wi-Fi du ministère via son navigateur web interne (Tizen / webOS / Android TV).
2. **Zone Administrative (Cellule de Communication & DSI) :**  
   - Postes de travail de bureau (PC Windows/Linux) accédant au panneau d'administration via navigateur web à l'adresse `http://[IP_SERVEUR]:5173/login`.
3. **Zone Serveur :**  
   - Une machine serveur dédiée (ou unité centrale hôte) exécutant le runtime Node.js sur le port 5000 et le serveur d'actifs Vite sur le port 5173.
   - Le démon `cloudflared.exe` qui maintient la passerelle chiffrée sans nécessiter l'ouverture de ports dans le routeur principal du ministère.

---

# CHAPITRE 7 : GUIDE PRATIQUE POUR DESSINER VOS DIAGRAMMES

Si votre établissement ou votre tuteur exige de produire les diagrammes dans un outil spécifique (StarUML, Draw.io, Visual Paradigm, Lucidchart, PlantUML), voici les instructions pour chaque type de diagramme :

### 7.1 Comment dessiner le Diagramme des Cas d'Utilisation (UML Use Case)
- **Frontière du système :** Tracez un grand rectangle central nommé *"Système MINPOSTEL Smart Display (MSD)"*.
- **Acteurs :** Placez les petits bonhommes à l'extérieur :
  - À gauche : Les acteurs humains (*Super Administrateur*, *Gestionnaire de Contenu*, *Visiteur / Usager*).
  - À droite : L'acteur système matériel (*Écran Kiosque Entrée*).
- **Cas d'utilisation :** Dessinez des ovales horizontaux à l'intérieur du rectangle :
  - *S'authentifier*, *Gérer les contenus*, *Déclencher une alerte d'urgence*, *Gérer les salles/bâtiments*, *Diffuser le carrousel 16:9*, *Scanner le QR Code*, *Naviguer sur le guide mobile*.
- **Relations :**
  - Reliez chaque acteur à ses cas d'utilisation par un trait plein.
  - Tracez une flèche pointillée `<<include>>` entre *Déclencher une alerte* et *Enregistrer dans le journal d'audit*.
  - Tracez une flèche pointillée `<<extend>>` entre *Scanner le QR Code* et *Naviguer sur le guide mobile*.

### 7.2 Comment dessiner le Diagramme de Classes / ERD
- Représentez chaque table sous forme de boîte divisée en 3 compartiments :
  1. Le nom de la classe/table en gras au sommet (ex : `MEETINGS`).
  2. Les attributs avec leurs types et visibilités (`+ id: INT [PK]`, `+ title_fr: VARCHAR`, `+ date: DATE`).
  3. Les méthodes ou contraintes.
- Tracez les associations en indiquant les multiplicités :
  - Entre `BUILDINGS` et `FLOORS` : `1` côté bâtiment, `1..*` côté étages.
  - Entre `FLOORS` et `ROOMS` : `1` côté étage, `1..*` côté salles.
  - Entre `ROOMS` et `MEETINGS` : `1` côté salle, `0..*` côté réunions.
  - Entre `USERS` et `ANNOUNCEMENTS` : `1` côté utilisateur créateur, `0..*` côté annonces.

### 7.3 Comment dessiner les Diagrammes de Séquence
- Alignez les participants sous forme de boîtes en haut de la page :
  - `Admin` (Acteur) | `Dashboard (Vue)` | `API Express (Contrôleur)` | `Socket.IO (Temps Réel)` | `Base de données` | `Écran Kiosque (Vue)`.
- Tracez une ligne verticale pointillée sous chaque participant (ligne de vie).
- Tracez des flèches horizontales numérotées de gauche à droite pour les appels (`POST /api/urgent-messages`), et des flèches pointillées de droite à gauche pour les retours (`200 OK`).
- Insérez un rectangle de boucle (*loop*) pour représenter le battement de cœur répété toutes les 15 secondes.

---

# CHAPITRE 8 : ARGUMENTS CLÉS POUR LA SOUTENANCE DEVANT LE JURY

Pour convaincre votre tuteur et obtenir la note maximale lors de votre soutenance, articulez votre discours autour des **6 arguments d'excellence technique** suivants :

1. **La Double Continuité de Service (Haute Résilience) :**  
   *« Dans de nombreuses administrations en Afrique, les pannes d'Internet sont récurrentes. Si notre serveur perd l'accès à Supabase ou au Cloud, le système MSD ne plante jamais. Le contrôleur bascule en 0 milliseconde sur le store mémoire local et le fichier physique `msd_store.json`. Le public dans le hall ne voit aucune interruption de service. »*
2. **L'Immédiateté du Temps Réel via WebSockets :**  
   *« Contrairement aux solutions d'affichage archaïques qui rafraîchissent la page toutes les 5 minutes (générant des clignotements désagréables), MSD utilise Socket.IO. Dès que le Cabinet valide un communiqué, le paquet binaire est poussé directement dans la mémoire de l'écran en moins de 50 millisecondes. »*
3. **Le Bilinguisme Constitutionnel Intégré :**  
   *« Conformément à la Constitution de la République du Cameroun qui consacre l'égalité parfaite du Français et de l'Anglais, MSD rend la saisie bilingue obligatoire et alterne automatiquement les langues à chaque cycle de carrousel sans aucune manipulation humaine. »*
4. **La Passerelle Physique-Numérique sans Friction (Zero-Install) :**  
   *« Forcer un usager à télécharger une application mobile sur l'App Store ou le Play Store pour trouver une salle de réunion est un échec d'expérience utilisateur. Grâce aux QR Codes vectoriels de MSD couplés au tunnel Cloudflare, le visiteur scanne l'écran avec son appareil photo natif et son navigateur affiche l'itinéraire en 2 secondes, qu'il soit sur le Wi-Fi ou sur son forfait 4G. »*
5. **La Sécurité & la Traçabilité Institutionnelle :**  
   *« Les écrans d'un ministère ne peuvent pas être piratés pour diffuser de fausses informations. Toutes les routes d'administration sont verrouillées par jetons JWT cryptographiques et chaque modification est signée avec l'identifiant de l'agent et son adresse IP dans les registres d'audit. »*
6. **L'Efficacité Énergétique et la Préservation du Matériel :**  
   *« Laisser un écran géant allumé 24h/24 provoque le brûlage de la dalle (*burn-in*) et gaspille l'électricité de l'État. Le démon `power.service.js` de MSD éteint automatiquement le rétroéclairage la nuit (18h-07h) et réveille le kiosque avant l'arrivée du personnel le matin. »*
