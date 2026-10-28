# MINPOSTEL SMART DISPLAY (MSD)
## Dossier d'Architecture et Conception Logicielle
> **Thème du Stage :** Conception et développement d'un système intelligent de gestion et d'affichage dynamique des informations au sein du Ministère des Postes et Télécommunications (MINPOSTEL).

---

## Sommaire Exécutif

Le présent document constitue le dossier officiel d'architecture et de conception logicielle du projet **MINPOSTEL Smart Display (MSD)**. Il est structuré pour permettre à l'étudiant d'expliquer avec précision à son tuteur de stage et au jury académique :
1. La problématique institutionnelle identifiée et la solution apportée.
2. La typologie des acteurs et la modélisation fonctionnelle (Cas d'Utilisation UML).
3. L'architecture logicielle modulaire en 4 tiers (Modèle C4 Container).
4. Le modèle de données relationnel (Diagramme Entité-Association / ERD).
5. Les dynamiques d'exécution en temps réel (Diagrammes de séquence).
6. Les machines à états-transitions régissant l'écran et les contenus.
7. La topologie physique et le déploiement réseau dans les locaux du MINPOSTEL.

> 💡 **Visualiseur Interactif :** Un visualiseur autonome prêt pour la soutenance est disponible dans [`docs/diagrams/view_diagrams.html`](file:///c:/Users/SOREL/Desktop/MINPOSTEL%20SMART%20DISPLAY%20%20%28MSD%29/docs/diagrams/view_diagrams.html). Il permet de parcourir tous les diagrammes avec zoom et rendu vectoriel dans n'importe quel navigateur web.

---

## 1. Contexte, Problématique & Solution Proposée

### 1.1 Contexte Institutionnel
Le Ministère des Postes et Télécommunications (MINPOSTEL) est l'organe central de l'État camerounais chargé de la formulation, de la mise en œuvre et du suivi de la politique gouvernementale en matière de télécommunications, de TIC et de services postaux. 
Chaque jour, le hall d'entrée principal du ministère accueille des délégations officielles, des usagers du service public, des partenaires techniques et des membres du cabinet ministériel.

### 1.2 Problématique Identifiée
L'audit du système d'information et d'accueil physique préalable au stage a révélé des freins opérationnels majeurs :
- **Affichage papier statique & obsolète :** Les communiqués, convocations de réunions et avis sont imprimés sur papier et punaisés sur des panneaux en liège, provoquant un encombrement visuel et une dégradation rapide des supports.
- **Désorientation des visiteurs :** Les usagers ignorent fréquemment dans quel bâtiment, à quel étage ou dans quelle salle se tient leur commission ou réunion, ce qui engendre des retards et encombre le poste de garde.
- **Incapacité de communication d'urgence en temps réel :** En cas d'incident, de crise sécuritaire ou d'instruction urgente du Ministre, aucun canal centralisé ne permettait de diffuser instantanément une consigne sur l'ensemble de l'enceinte ministérielle.
- **Rupture numérique mobile :** Aucun pont n'existait pour transférer l'information consultée à l'accueil vers le smartphone de l'usager sans nécessiter l'installation complexe d'une application mobile.

### 1.3 Diagramme 01 : Contexte Problème vs Solution
```mermaid
flowchart TB
    subgraph PROBLEM_SPACE ["🔴 ÉTAT DES LIEUX & PROBLÉMATIQUE ACTUELLE (MINPOSTEL)"]
        direction TB
        P1["📄 Affichage Papier & Panneaux Liège<br/>(Notes de service collées, statiques, obsolètes)"]
        P2["🚶‍♂️ Visiteurs et Usagers Désorientés<br/>(Recherche difficile des salles, étages et réunions)"]
        P3["⏱️ Délais Critiques de Diffusion<br/>(Impossibilité de relayer une urgence ministérielle en temps réel)"]
        P4["⚠️ Surcharge du Poste de Garde / Accueil<br/>(Demandes répétitives d'orientation physique)"]
        P5["🌐 Rupture Numérique Mobile<br/>(Aucun transfert d'information vers le smartphone du visiteur)"]
        
        P1 --> P2
        P3 --> P4
        P2 --> P5
    end

    subgraph MSD_SOLUTION ["🟢 SOLUTION PROPOSÉE : MINPOSTEL SMART DISPLAY (MSD)"]
        direction TB
        S1["🖥️ Écran Dynamique Kiosque Entrée Principale<br/>(Diffusion automatique 16:9, météo Yaoundé, heure, flux)"]
        S2["⚡ Diffusion Instantanée par WebSockets<br/>(Mise à jour en direct < 1 seconde via Socket.IO)"]
        S3["🚨 Bandeau d'Alerte Ministérielle Prioritaire<br/>(Interruption instantanée du flux normal en cas d'urgence)"]
        S4["📱 Passerelle QR Code & Guide Mobile<br/>(Orientation dans le bâtiment sans installer d'application)"]
        S5["🌐 Bilinguisme Institutionnel Automatique<br/>(Alternance synchronisée Français / Anglais conforme aux normes)"]
        S6["📊 Surveillance Matérielle & Heartbeat<br/>(Monitoring de santé des écrans et gestion éco-énergie)"]

        S1 --- S2
        S2 --- S3
        S1 --- S4
        S4 --- S5
        S3 --- S6
    end

    PROBLEM_SPACE ==>|"TRANSFORMATION DIGITALE & MODERNISATION"| MSD_SOLUTION
```

---

## 2. Spécification des Acteurs & Diagramme des Cas d'Utilisation

### 2.1 Description des Acteurs
1. **Administrateur Principal (Super Admin) :** Dispose des privilèges complets sur l'infrastructure (gestion des utilisateurs, attribution des rôles, journalisation d'audit, déclenchement des alertes de crise, supervision de la santé des écrans et configuration du réseau/tunnel).
2. **Gestionnaire de Contenu (Content Manager) :** Responsable de la cellule de communication ministérielle. Rédige, planifie et modifie les annonces, les réunions, les événements, téléverse les affiches officielles et consulte la prévisualisation de l'écran.
3. **Visiteur / Usager Public :** Consulte l'écran physique dans le hall d'entrée (heure, météo, diaporamas), observe l'alternance bilingue FR/EN, et scanne le QR code d'une réunion avec son smartphone pour obtenir l'orientation jusqu'à la salle.
4. **Écran Kiosque (Acteur Système Autonome) :** Appareil connecté physique (Smart TV / Kiosque d'affichage). S'enregistre automatiquement au démarrage, transmet des pulsations de vie (heartbeats) toutes les 15 secondes, bascule la langue à la fin de chaque boucle de playlist, et passe en mode veille écologique la nuit.

### 2.2 Diagramme 02 : Cas d'Utilisation UML (Use Case)
```mermaid
flowchart LR
    subgraph ACTORS ["ACTEURS DU SYSTÈME"]
        SA["👤 Administrateur Principal<br/>(Super Admin)"]
        CM["👤 Gestionnaire de Contenu<br/>(Content Manager)"]
        VP["👥 Visiteur / Usager<br/>(Public)"]
        DS["🖥️ Écran Kiosque Entrée<br/>(Système Matériel)"]
    end

    subgraph MSD_SYSTEM ["SYSTÈME MINPOSTEL SMART DISPLAY (MSD)"]
        
        subgraph PKG_AUTH ["Sécurité & Contrôle d'Accès"]
            UC_LOGIN(["S'authentifier (JWT / Cookie)"])
            UC_USERS(["Gérer les Comptes & Rôles"])
            UC_LOGS(["Consulter les Journaux d'Activité (Audit)"])
        end

        subgraph PKG_CONTENT ["Gestion Éditoriale & Diffusion"]
            UC_ANN(["Publier / Modifier des Annonces"])
            UC_MEET(["Planifier des Réunions Ministérielles"])
            UC_EVENT(["Organiser les Événements & Ateliers"])
            UC_COMM(["Diffuser les Communications du Cabinet"])
            UC_MEDIA(["Gérer la Médiathèque (Images/Vidéos)"])
        end

        subgraph PKG_EMERGENCY ["Gestion de Crise & Alertes"]
            UC_URGENT_START(["Déclencher une Alerte Ministérielle Urgente"])
            UC_URGENT_STOP(["Stopper la Diffusion de Crise"])
        end

        subgraph PKG_INFRA ["Infrastructure & Matériel"]
            UC_SETTINGS(["Configurer les Paramètres (Durée, Thème)"])
            UC_LOCATIONS(["Gérer les Bâtiments, Étages et Salles"])
            UC_MONITOR(["Surveiller l'État de Santé des Écrans (Heartbeat)"])
            UC_POWER(["Piloter la Gestion d'Énergie (Veille/Réveil)"])
        end

        subgraph PKG_KIOSK ["Affichage Public & Orientation"]
            UC_DISPLAY_ROT(["Consulter le Carrousel Dynamique 16:9"])
            UC_DISPLAY_LANG(["Observer l'Alternance Bilingue FR / EN"])
            UC_DISPLAY_CLOCK(["Consulter l'Heure et la Météo de Yaoundé"])
            UC_SCAN_QR(["Scanner le QR Code d'une Réunion / Événement"])
            UC_MOBILE_NAV(["Naviguer sur le Guide Mobile Visiteur"])
            UC_PINGS(["Émettre les Battements de Cœur (Heartbeats)"])
        end

    end

    SA --> UC_LOGIN
    SA --> UC_USERS
    SA --> UC_LOGS
    SA --> UC_SETTINGS
    SA --> UC_LOCATIONS
    SA --> UC_MONITOR
    SA --> UC_POWER
    SA --> UC_URGENT_START
    SA --> UC_URGENT_STOP

    CM --> UC_LOGIN
    CM --> UC_ANN
    CM --> UC_MEET
    CM --> UC_EVENT
    CM --> UC_COMM
    CM --> UC_MEDIA
    SA --> UC_ANN
    SA --> UC_MEET
    SA --> UC_EVENT

    VP --> UC_DISPLAY_ROT
    VP --> UC_DISPLAY_LANG
    VP --> UC_DISPLAY_CLOCK
    VP --> UC_SCAN_QR
    VP --> UC_MOBILE_NAV

    DS --> UC_PINGS
    DS --> UC_DISPLAY_ROT

    UC_SCAN_QR -.->|"<<extend>>"| UC_MOBILE_NAV
    UC_URGENT_START -.->|"<<include>>"| UC_LOGS
    UC_MEET -.->|"<<include>>"| UC_LOCATIONS
```

---

## 3. Architecture Logicielle & Modèle C4 (Container)

Le système adopte une architecture multi-tiers hautement résiliente conçue pour fonctionner avec ou sans accès à Internet.

### 3.1 Décomposition des Niveaux
- **Tier 1 - Présentation (Frontend React 18 & Vite) :** Composé de trois applications monopages (SPA) :
  - *Admin Dashboard* (`/dashboard`) : Interface d'administration institutionnelle.
  - *Public Display Screen* (`/display/:screenId`) : Vue plein écran 16:9 auto-animée pour TV commerciale.
  - *Mobile Visitor Portal* (`/visitor`) : Vue progressive optimisée pour smartphones lors du scan de QR codes.
- **Tier 2 - Passerelle & Transport Réseau :**
  - *Réseau Local LAN / Wi-Fi MINPOSTEL :* Permet une diffusion locale ultra-rapide sans latence.
  - *Tunnel Sécurisé Cloudflare (`cloudflared`) :* Crée un tunnel HTTPS sortant chiffré vers Internet pour permettre aux usagers en données cellulaires (4G/5G) de scanner et d'ouvrir le guide d'orientation.
  - *Moteur d'Événements WebSocket (`Socket.IO`) :* Canal bi-directionnel à moins de 50 millisecondes de latence pour la synchronisation immédiate des écrans.
- **Tier 3 - Métier & Application (Node.js + Express.js) :**
  - Contrôleurs RESTful avec authentification JWT et hashing Bcrypt.
  - Service de gestion d'énergie (`power.service.js`) programmant la mise en veille nocturne.
  - Moniteur de battements de cœur (`display.socket.js`) détectant les pannes d'écran après 45 secondes sans ping.
- **Tier 4 - Persistance Résiliente Polyvalente :**
  - *PostgreSQL / Supabase :* Base de données Cloud pour la synchronisation distante.
  - *MySQL 8.0+ :* Base de données relationnelle locale sur site (On-Premises).
  - *Moteur Local JSON Résilient (`msd_store.json`) :* Système de cache mémoire à écriture asynchrone qui prend le relais instantanément si les serveurs SQL sont coupés ou hors ligne.

### 3.2 Diagramme 03 : Architecture Système (C4 Container)
```mermaid
flowchart TB
    subgraph CLIENT_TIER ["1. COUCHE PRÉSENTATION (Frontend React 18 + Vite)"]
        direction LR
        UI_ADMIN["💻 Panneau d'Administration Web<br/><b>Admin Dashboard (SPA)</b><br/>• React 18 / Lucide Icons<br/>• Gestion de contenu & audits<br/>• Déclencheur d'alertes"]
        UI_KIOSK["🖥️ Écran d'Affichage Kiosque<br/><b>Public Display View</b><br/>• Format 16:9 Full HD / 4K<br/>• Carrousel synchronisé & Météo<br/>• Générateur dynamique de QR Codes"]
        UI_MOBILE["📱 Portail Visiteur Mobile<br/><b>Mobile Visitor Webapp</b><br/>• Vue responsive sans installation<br/>• Orientation salles, étages, horaires<br/>• Accessible sur Wi-Fi ou 4G/5G"]
    end

    subgraph GATEWAY_TIER ["2. PASSERELLE RÉSEAU & TRANSPORT SÉCURISÉ"]
        direction LR
        GW_LAN["🏢 Réseau Local LAN / Wi-Fi MINPOSTEL<br/>(HTTP / WebSocket direct: Ports 5000 & 5173)"]
        GW_TUNNEL["☁️ Service Tunnel Cloudflare (cloudflared)<br/>(Tunnel HTTPS sécurisé pour accès cellulaire 4G/5G)"]
        GW_WS["⚡ Moteur d'Événements WebSocket<br/>(Socket.IO bi-directionnel à faible latence)"]
    end

    subgraph SERVER_TIER ["3. COUCHE MÉTIER & APPLICATION (Node.js + Express.js)"]
        direction TB
        subgraph API_ROUTERS ["Contrôleurs & Routes RESTful"]
            direction LR
            R_AUTH["🔐 Auth (JWT & Bcrypt)"]
            R_CONTENT["📢 Content (Annonces, Réunions, Events)"]
            R_URGENT["🚨 Urgent Alerts (Broadcast)"]
            R_MEDIA["🖼️ Media Manager (Multer)"]
            R_LOC["🏢 Locations (Salles/Étages)"]
            R_SET["⚙️ System Settings & Logs"]
        end

        subgraph BG_SERVICES ["Services d'Arrière-Plan & Daemons"]
            direction LR
            S_SOCKET["📡 Sockets Gateway<br/>(Rooms & Channels)"]
            S_HEARTBEAT["💓 Moniteur Heartbeat<br/>(Détection panne écran >45s)"]
            S_POWER["🌙 Power Manager<br/>(Veille & Réveil programmés)"]
            S_TUNNEL_SVC["🌐 Tunnel Watcher<br/>(Auto-reconnexion & backoff)"]
        end
    end

    subgraph DATA_TIER ["4. COUCHE PERSISTANCE & DONNÉES (Architecture Résiliente)"]
        direction LR
        DB_POSTGRES[("🐘 PostgreSQL / Supabase<br/>(Base distante Cloud & Pooling)")]
        DB_MYSQL[("🐬 MySQL 8.0+ / MariaDB<br/>(Base relationnelle On-Premises)")]
        DB_JSON[("💾 Store Local JSON & RAM<br/>(msd_store.json - Tolérance aux pannes)")]
        STORAGE_FS[("📁 Système de Fichiers /uploads<br/>(Affiches, Médias, Images)")]
    end

    UI_ADMIN -->|"HTTP REST & JWT"| GW_LAN
    UI_KIOSK -->|"WebSocket & HTTP"| GW_LAN
    UI_MOBILE -->|"HTTP / QR Target"| GW_TUNNEL
    UI_MOBILE -.->|"Alternative Wi-Fi"| GW_LAN

    GW_LAN --> R_AUTH
    GW_LAN --> R_CONTENT
    GW_LAN --> R_URGENT
    GW_LAN --> R_MEDIA
    GW_LAN --> R_LOC
    GW_LAN --> R_SET
    GW_TUNNEL --> R_CONTENT
    GW_TUNNEL --> R_LOC

    GW_LAN <==>|"Bi-directional Sync"| GW_WS
    GW_WS <==> S_SOCKET

    S_SOCKET --> UI_KIOSK
    S_SOCKET --> UI_ADMIN
    S_HEARTBEAT --> S_SOCKET
    S_POWER --> S_SOCKET
    S_TUNNEL_SVC -.-> GW_TUNNEL

    R_AUTH & R_CONTENT & R_URGENT & R_LOC & R_SET ==>|"Driver Polyvalent"| DB_POSTGRES
    R_AUTH & R_CONTENT & R_URGENT & R_LOC & R_SET -.->|"Mode Local On-Prem"| DB_MYSQL
    R_AUTH & R_CONTENT & R_URGENT & R_LOC & R_SET ==>|"Repli Résilient Automatique"| DB_JSON
    R_MEDIA --> STORAGE_FS
```

---

## 4. Organisation de la Base de Données (Diagramme Entité-Association)

Le modèle de données répond à 3 exigences majeures :
1. **La binarité linguistique (Bilinguisme constitutionnel) :** Tous les champs textuels destinés au public possèdent une version française (`_fr`) et une version anglaise (`_en`).
2. **La modélisation de l'espace physique :** Relation stricte de containment : `buildings` (1) ➔ `floors` (N) ➔ `rooms` (N) permettant de géolocaliser n'importe quelle salle de réunion.
3. **La traçabilité et l'auditabilité :** Chaque action administrative sensible est enregistrée dans `activity_logs` avec l'adresse IP et l'identifiant de l'agent.

### 4.1 Diagramme 04 : ERD Relationnel Complet
```mermaid
erDiagram
    ROLES ||--o{ USERS : "attribue à (1:N)"
    USERS ||--o{ MEDIA : "téléverse (1:N)"
    USERS ||--o{ ANNOUNCEMENTS : "crée (1:N)"
    USERS ||--o{ MEETINGS : "planifie (1:N)"
    USERS ||--o{ EVENTS : "organise (1:N)"
    USERS ||--o{ STAFF_COMMUNICATIONS : "rédige (1:N)"
    USERS ||--o{ URGENT_MESSAGES : "diffuse (1:N)"
    USERS ||--o{ ACTIVITY_LOGS : "génère (1:N)"

    BUILDINGS ||--o{ FLOORS : "comporte (1:N)"
    FLOORS ||--o{ ROOMS : "contient (1:N)"

    BUILDINGS ||--o{ MEETINGS : "héberge (1:N)"
    FLOORS ||--o{ MEETINGS : "situe (1:N)"
    ROOMS ||--o{ MEETINGS : "abrite (1:N)"

    BUILDINGS ||--o{ EVENTS : "accueille (1:N)"
    FLOORS ||--o{ EVENTS : "situe (1:N)"
    ROOMS ||--o{ EVENTS : "abrite (1:N)"

    MEDIA ||--o{ ANNOUNCEMENTS : "illustre (0:N)"
    MEDIA ||--o{ MEETINGS : "illustre (0:N)"
    MEDIA ||--o{ EVENTS : "illustre (0:N)"
    MEDIA ||--o{ STAFF_COMMUNICATIONS : "illustre (0:N)"
    MEDIA ||--o{ URGENT_MESSAGES : "illustre (0:N)"

    ROLES {
        int id PK
        varchar name UK
        varchar description
        timestamp created_at
    }

    USERS {
        int id PK
        int role_id FK
        varchar username UK
        varchar email UK
        varchar password_hash
        varchar full_name
        boolean is_active
        timestamp last_login
        timestamp created_at
    }

    BUILDINGS {
        int id PK
        varchar code UK
        varchar name_fr
        varchar name_en
        timestamp created_at
    }

    FLOORS {
        int id PK
        int building_id FK
        int floor_number
        varchar name_fr
        varchar name_en
        timestamp created_at
    }

    ROOMS {
        int id PK
        int floor_id FK
        varchar room_number
        varchar name_fr
        varchar name_en
        int capacity
        timestamp created_at
    }

    DISPLAY_SCREENS {
        int id PK
        varchar screen_code UK
        varchar name
        varchar location_description
        enum status "ONLINE, OFFLINE"
        timestamp last_heartbeat
        varchar ip_address
        timestamp updated_at
    }

    MEDIA {
        int id PK
        varchar filename
        varchar original_name
        varchar mime_type
        int file_size
        varchar file_path
        enum language "FR, EN, BOTH"
        int uploaded_by FK
        timestamp created_at
    }

    ANNOUNCEMENTS {
        int id PK
        varchar title_fr
        varchar title_en
        text description_fr
        text description_en
        enum priority "NORMAL, IMPORTANT, URGENT"
        enum status "DRAFT, SCHEDULED, PUBLISHED, EXPIRED"
        date start_date
        date end_date
        int media_id FK
        int created_by FK
        timestamp created_at
    }

    MEETINGS {
        int id PK
        varchar title_fr
        varchar title_en
        text description_fr
        text description_en
        date date
        time start_time
        time end_time
        int building_id FK
        int floor_id FK
        int room_id FK
        text participants_info
        enum priority "NORMAL, IMPORTANT, URGENT"
        enum status "SCHEDULED, UPCOMING, IN_PROGRESS, COMPLETED"
        boolean is_published
        int media_id FK
        int created_by FK
        timestamp created_at
    }

    EVENTS {
        int id PK
        varchar title_fr
        varchar title_en
        text description_fr
        text description_en
        date date
        time start_time
        time end_time
        int building_id FK
        int floor_id FK
        int room_id FK
        varchar organizer
        varchar target_audience
        enum priority "NORMAL, IMPORTANT, URGENT"
        enum status "SCHEDULED, UPCOMING, IN_PROGRESS, COMPLETED"
        boolean is_published
        int media_id FK
        int created_by FK
        timestamp created_at
    }

    STAFF_COMMUNICATIONS {
        int id PK
        varchar title_fr
        varchar title_en
        text content_fr
        text content_en
        enum priority "NORMAL, IMPORTANT, URGENT"
        enum visibility "PUBLIC, STAFF, RESTRICTED"
        enum status "DRAFT, PUBLISHED, EXPIRED"
        date start_date
        date end_date
        int media_id FK
        int created_by FK
        timestamp created_at
    }

    URGENT_MESSAGES {
        int id PK
        text message_fr
        text message_en
        enum priority "HIGH, CRITICAL"
        enum status "ACTIVE, INACTIVE, EXPIRED"
        datetime start_time
        datetime end_time
        int media_id FK
        int created_by FK
        timestamp created_at
    }

    ACTIVITY_LOGS {
        int id PK
        int user_id FK
        varchar action
        varchar entity_type
        int entity_id
        text description
        varchar ip_address
        timestamp created_at
    }

    SYSTEM_SETTINGS {
        int id PK
        varchar setting_key UK
        text setting_value
        varchar description
        timestamp updated_at
    }
```

---

## 5. Dynamiques du Système (Diagrammes de Séquence)

### 5.1 Diagramme 05 : Alerte Ministérielle d'Urgence en Temps Réel
Illustre la propagation immédiate d'un message critique via WebSockets et la substitution prioritaire de l'affichage normal sur l'écran kiosque.
```mermaid
sequenceDiagram
    autonumber
    actor Admin as 👤 Administrateur Principal
    participant Dashboard as 💻 Admin Dashboard (SPA)
    participant API as 🚀 Express REST API
    participant Socket as ⚡ Socket.IO Engine
    participant DB as 💾 Base de Données / Store
    participant Kiosk as 🖥️ Écran Kiosque Entrée
    actor Visitor as 👥 Visiteurs / Usagers

    Note over Admin,Visitor: 1. DÉCLENCHEMENT D'UNE ALERTE MINISTÉRIELLE PRIORITAIRE
    Admin->>Dashboard: Saisit message (FR + EN) & Priorité "CRITIQUE"
    Admin->>Dashboard: Clique sur "Diffuser Alerte Immédiate"
    Dashboard->>API: POST /api/urgent-messages/broadcast {message_fr, message_en, priority}
    activate API
    API->>API: Vérifie Token JWT & Droits Super Admin
    API->>DB: Enregistre message & statut="ACTIVE", start_time=NOW()
    API->>DB: Enregistre log d'activité (Audit Trail)
    API->>Socket: io.emit("URGENT_MESSAGE_BROADCAST", urgentMessage)
    deactivate API
    
    activate Socket
    Socket-->>Kiosk: Événement WebSocket instantané < 50ms
    Socket-->>Dashboard: Notification temps réel aux autres admins
    deactivate Socket

    activate Kiosk
    Kiosk->>Kiosk: Interrompt immédiatement le carrousel normal
    Kiosk->>Kiosk: Affiche le bandeau d'alerte rouge clignotant
    Kiosk->>Kiosk: Déclenche le signal sonore d'attention (Audio API)
    Kiosk-->>Visitor: Message d'urgence visible à 100% dans le hall
    deactivate Kiosk

    Note over Admin,Visitor: 2. FIN DE L'ALERTE & REPRISE DU SERVICE NORMAL
    Admin->>Dashboard: Clique sur "Arrêter la Diffusion"
    Dashboard->>API: POST /api/urgent-messages/stop/:id
    activate API
    API->>DB: Met à jour statut="INACTIVE", stopped_at=NOW(), calcule durée
    API->>Socket: io.emit("URGENT_MESSAGE_STOPPED", { id })
    deactivate API

    activate Socket
    Socket-->>Kiosk: Événement "URGENT_MESSAGE_STOPPED"
    deactivate Socket

    activate Kiosk
    Kiosk->>Kiosk: Masque le bandeau d'alerte de crise
    Kiosk->>Kiosk: Reprend la rotation normale des annonces et réunions
    deactivate Kiosk
```

### 5.2 Diagramme 06 : Carrousel Dynamique & Alternance Bilingue FR / EN
Illustre le fonctionnement autonome de l'écran 16:9 dans le hall d'entrée : rotation minutée et bascule de langue automatique.
```mermaid
sequenceDiagram
    autonumber
    participant Kiosk as 🖥️ Écran Kiosque (PublicDisplayPage)
    participant API as 🚀 Express REST API (/api/feed)
    participant Socket as ⚡ Socket.IO Engine
    participant Admin as 💻 Admin Dashboard

    Note over Kiosk,API: 1. INITIALISATION DE L'ÉCRAN À LA MISE SOUS TENSION
    Kiosk->>API: GET /api/feed/display/MINPOSTEL-MAIN-ENTRANCE-01
    activate API
    API-->>Kiosk: 200 OK (Flux agrégé: Annonces, Réunions du jour, Événements, Paramètres)
    deactivate API

    Kiosk->>Socket: Émet "DISPLAY_REGISTER" {screenId, status: "ONLINE"}
    activate Socket
    Socket-->>Admin: Diffuse "DISPLAY_STATUS_UPDATE" (Écran Vert / ONLINE)
    deactivate Socket

    Note over Kiosk: 2. CYCLE AUTOMATIQUE DU CARROUSEL & ALTERNANCE LINGUISTIQUE
    loop Toutes les N secondes (ex: 15s)
        Kiosk->>Kiosk: Anime la barre de progression (0% à 100%)
        Kiosk->>Kiosk: Passe à la diapositive suivante: (index + 1) % total
        alt Fin du tour complet du carrousel (index == 0)
            Kiosk->>Kiosk: Bascule la langue active: FR ⟷ EN
            Kiosk->>Kiosk: Ré-affiche les titres et descriptions dans la nouvelle langue
        end
        Kiosk->>Kiosk: Génère le QR Code correspondant à l'élément affiché
    end

    Note over Admin,Kiosk: 3. SYNCHRONISATION INSTANTANÉE LORS D'UN AJOUT ÉDITORIAL
    Admin->>API: POST /api/meetings (Nouvelle réunion de crise au Cabinet)
    activate API
    API->>Socket: io.emit("MEETING_CREATED", newMeetingData)
    deactivate API

    activate Socket
    Socket-->>Kiosk: Réception temps réel "MEETING_CREATED"
    deactivate Socket

    Kiosk->>Kiosk: Intègre immédiatement la nouvelle réunion dans la playlist active
    Note over Kiosk: Mise à jour sans aucun rechargement de page (F5 inutile)
```

### 5.3 Diagramme 07 : Passerelle QR Code & Guidage Visiteur Mobile
Montre le transfert fluide de l'écran public vers le smartphone personnel du visiteur.
```mermaid
sequenceDiagram
    autonumber
    actor Visitor as 🚶‍♂️ Visiteur / Usager MINPOSTEL
    participant Screen as 🖥️ Écran Kiosque (Hall Entrée)
    participant Phone as 📱 Smartphone du Visiteur
    participant Tunnel as ☁️ Cloudflare Tunnel / Wi-Fi
    participant API as 🚀 Serveur Backend MSD
    participant DB as 💾 Données d'Orientation

    Note over Visitor,Screen: 1. ARRIVÉE DANS LE HALL DU MINISTÈRE
    Visitor->>Screen: Observe la diapositive de la réunion ou de l'atelier
    Screen->>Screen: Affiche le QR Code généré dynamiquement pour cet élément
    
    Note over Visitor,Phone: 2. CAPTURE & TRANSFERT NUMÉRIQUE SANS APPLICATION
    Visitor->>Phone: Ouvre l'appareil photo du smartphone
    Phone->>Screen: Vise et scanne le QR Code affiché sur l'écran 16:9
    Phone->>Phone: Détecte l'URL: https://[tunnel-ou-ip]/visitor/meeting/42

    Note over Phone,API: 3. CHARGEMENT SÉCURISÉ DU GUIDE D'ORIENTATION MOBILE
    Phone->>Tunnel: Requête HTTPS vers la route visiteur
    Tunnel->>API: GET /api/meetings/42 & GET /api/locations
    activate API
    API->>DB: Récupère détails (Bâtiment, Étage, Numéro Salle, Capacité, Horaires)
    API-->>Phone: 200 OK + Rendu de la page MobileVisitorPage.jsx
    deactivate API

    Note over Visitor,Phone: 4. GUIDAGE AUTONOME DANS LES BÂTIMENTS DU MINPOSTEL
    Phone-->>Visitor: Affiche l'itinéraire précis: "Bâtiment Principal ➔ 2e Étage ➔ Salle Conférence B"
    Visitor->>Phone: Peut basculer la langue FR ⟷ EN sur son téléphone
    Visitor->>Visitor: Se déplace directement vers la salle sans encombrer le poste de garde
```

### 5.4 Diagramme 08 : Surveillance Heartbeat et Tolérance aux Pannes
Explique la détection automatique des pannes d'écran par l'infrastructure centrale.
```mermaid
sequenceDiagram
    autonumber
    participant Kiosk as 🖥️ Écran Kiosque (Smart TV / Kiosk)
    participant Socket as ⚡ Socket.IO Gateway
    participant Monitor as 💓 Daemon Heartbeat Monitor
    participant Admin as 💻 Panneau d'Administration

    Note over Kiosk,Socket: 1. ÉMISSION RÉGULIÈRE DES BATTEMENTS DE CŒUR (Pings)
    loop Toutes les 15 secondes (Intervalle nominal)
        Kiosk->>Socket: socket.emit("DISPLAY_HEARTBEAT", { screenId: "MINPOSTEL-MAIN-ENTRANCE-01" })
        activate Socket
        Socket->>Socket: Met à jour screenStatusMap (statut="ONLINE", lastHeartbeat=NOW)
        Socket-->>Admin: io.emit("DISPLAY_STATUS_UPDATE", { status: "ONLINE", screenId })
        deactivate Socket
    end

    Note over Monitor,Socket: 2. BALAYAGE DE SURVEILLANCE & DÉTECTION DE PANNE
    loop Toutes les 15 secondes
        Monitor->>Monitor: Calcule diffSeconds = (Now - lastHeartbeat)
        alt diffSeconds <= 45s
            Monitor->>Monitor: Écran opérationnel (Aucune action)
        else diffSeconds > 45s (Coupure réseau ou extinction écran)
            Monitor->>Monitor: Détecte la rupture de pulsation
            Monitor->>Socket: Marque l'écran en statut "OFFLINE"
            activate Socket
            Socket-->>Admin: io.emit("DISPLAY_STATUS_UPDATE", { status: "OFFLINE", screenId })
            deactivate Socket
            Admin->>Admin: Le badge passe immédiatement au ROUGE ("HORS LIGNE")
            Admin->>Admin: Alerte visuelle pour l'équipe technique MINPOSTEL
        end
    end

    Note over Kiosk,Admin: 3. RÉTABLISSEMENT AUTOMATIQUE DU SERVICE
    Kiosk->>Socket: Rétablissement réseau ➔ Nouveau "DISPLAY_HEARTBEAT"
    activate Socket
    Socket-->>Admin: io.emit("DISPLAY_STATUS_UPDATE", { status: "ONLINE", screenId })
    deactivate Socket
    Admin->>Admin: Le badge redevient VERT ("EN LIGNE") automatiquement
```

---

## 6. Diagrammes de Machines à États

### 6.1 Diagramme 09 : Cycle de Vie de l'Écran Kiosque
```mermaid
stateDiagram-v2
    [*] --> NON_INITIALISE : Démarrage matériel / Écran branché

    state NON_INITIALISE {
        [*] --> ChargementApp : Chargement SPA React
        ChargementApp --> RequeteFlux : Appel GET /api/feed/display
        RequeteFlux --> EnregistrementSocket : Émission DISPLAY_REGISTER
    }

    NON_INITIALISE --> CARROUSEL_ACTIF : Initialisation réussie (Status 200)
    NON_INITIALISE --> HORS_LIGNE : Échec réseau / Serveur inaccessible

    state CARROUSEL_ACTIF {
        [*] --> DiapositiveNormale
        DiapositiveNormale --> DiapositiveSuivante : Expiration durée diapo (10-20s)
        DiapositiveSuivante --> BasculeLangue : Fin du tour de playlist (index == 0)
        BasculeLangue --> DiapositiveNormale : Nouvelle langue (FR ⟷ EN)
        --
        [*] --> EmissionHeartbeat : Toutes les 15s
        EmissionHeartbeat --> EmissionHeartbeat : Envoi ping Socket.IO
    }

    CARROUSEL_ACTIF --> ALERTE_URGENTE : Événement Socket URGENT_MESSAGE_BROADCAST
    ALERTE_URGENTE --> CARROUSEL_ACTIF : Événement Socket URGENT_MESSAGE_STOPPED

    state ALERTE_URGENTE {
        [*] --> GelCarrousel : Mise en pause du flux normal
        GelCarrousel --> AffichageBandeauRouge : Bannière plein écran clignotante
        AffichageBandeauRouge --> AlerteSonore : Émission du bip audio d'attention
    }

    CARROUSEL_ACTIF --> VEILLE_ECO : Commande POWER_OFF ou Heure >= 18h00
    VEILLE_ECO --> CARROUSEL_ACTIF : Commande POWER_ON ou Heure >= 07h00

    state VEILLE_ECO {
        [*] --> EcranNoir : Rendu 100% noir (Préservation dalle)
        EcranNoir --> MaintienHeartbeat : Surveillance réseau toujours active
    }

    CARROUSEL_ACTIF --> HORS_LIGNE : Perte connexion réseau (>45s)
    HORS_LIGNE --> CARROUSEL_ACTIF : Rétablissement du lien Socket / Reconnect

    state HORS_LIGNE {
        [*] --> CacheLocal : Affichage du dernier flux mémorisé
        CacheLocal --> TentativeReconnexion : Reconnexion automatique en boucle
    }
```

### 6.2 Diagramme 10 : Cycle de Vie Éditorial des Contenus
```mermaid
stateDiagram-v2
    [*] --> BROUILLON : Création par l'Agent de Communication

    state BROUILLON {
        [*] --> SaisieBilingue : Rédaction FR et EN obligatoire
        SaisieBilingue --> AttachementMedia : Téléversement affiche / logo optionnel
    }

    BROUILLON --> PROGRAMME : Date de début future (start_date > Today)
    BROUILLON --> PUBLIE : Publication immédiate (start_date <= Today)

    state PROGRAMME {
        [*] --> EnAttenteDate : Stocké en base de données
        EnAttenteDate --> DéclenchementAutomatique : Arrivée de la date/heure de début
    }

    PROGRAMME --> PUBLIE : Début de la période de diffusion

    state PUBLIE {
        [*] --> InjectionPlaylist : Agrégation dans /api/feed
        InjectionPlaylist --> DiffusionTempsReel : Émission Socket.IO vers les écrans
        DiffusionTempsReel --> GenerationQRCode : Calcul de l'URL pour les usagers
    }

    PUBLIE --> EN_COURS : Pour les Réunions / Ateliers (Heure actuelle entre début et fin)
    EN_COURS --> CLOTURE : Heure de fin atteinte (end_time)

    PUBLIE --> EXPIRE : Date de fin atteinte (end_date < Today)
    PUBLIE --> ANNULE : Annulation manuelle par l'administrateur

    state EXPIRE {
        [*] --> RetraitPlaylist : Retiré automatiquement du flux d'affichage
        RetraitPlaylist --> ArchivageBDD : Conservé pour historique et statistiques
    }

    EXPIRE --> [*]
    CLOTURE --> [*]
    ANNULE --> [*]
```

---

## 7. Déploiement Physique & Topologie Réseau

### 7.1 Implantation dans les Bâtiments du MINPOSTEL
L'architecture physique met en relation :
1. **Le Hall d'Entrée (Rez-de-chaussée) :** Une Smart TV 65 pouces 16:9 connectée en Wi-Fi ou HDMI à un lecteur multimédia (Mini-PC / Android TV).
2. **Le Bureau de Communication / DSI :** Les postes de travail administrant la plateforme via navigateur web.
3. **Le Serveur Hôte :** Un ordinateur ou serveur local exécutant Node.js (Port 5000), Vite (Port 5173) et le démon `cloudflared`.
4. **Les Usagers Mobiles :** Connectés soit sur le Wi-Fi Visiteur du Ministère, soit sur leur forfait 4G/5G via la passerelle Cloudflare.

### 7.2 Diagramme 11 : Topologie Réseau & Déploiement
```mermaid
flowchart TB
    subgraph SITE_MINPOSTEL ["🏛️ SITE DU MINISTÈRE DES POSTES ET TÉLÉCOMMUNICATIONS (YAOUNDÉ)"]
        
        subgraph ZONE_HALL ["📍 Hall de l'Entrée Principale (Rez-de-Chaussée)"]
            TV_SCREEN["📺 Écran Géant Kiosque 55''- 65'' (16:9)<br/><b>Affichage Dynamique Principal</b><br/>• Résolution 1080p / 4K Landscape<br/>• Navigateur Web Tizen/WebOS/Android TV<br/>• URL: http://[IP_SERVEUR]:5173/display/MINPOSTEL-MAIN-ENTRANCE-01"]
            SMARTPHONES["📱 Smartphones des Visiteurs & Usagers<br/>• Scannent les QR codes en direct<br/>• Connexion Wi-Fi Invité ou Données Mobiles 4G/5G"]
        end

        subgraph ZONE_ADMIN ["💼 Cellule de Communication & DSI (Bâtiment Principal)"]
            PC_ADMIN["💻 Ordinateur du Gestionnaire / DSI<br/>• Navigateur moderne (Chrome / Edge / Firefox)<br/>• URL: http://[IP_SERVEUR]:5173/login<br/>• Publication, gestion de crise, supervision"]
        end

        subgraph ZONE_SERVER ["🖥️ Serveur Hôte d'Application (PC Local / Mini-PC NUC)"]
            APP_SRV["⚙️ Serveur Backend Node.js (Port 5000)<br/>• API Express & Moteur Socket.IO<br/>• Daemons Heartbeat & Power Management"]
            APP_CLIENT["🌐 Serveur Frontend Vite / Client (Port 5173)<br/>• Distribution des SPAs React 18"]
            DB_LOCAL[("💾 BDD MySQL 8.0 / Store msd_store.json<br/>• Données locales & tolérance aux pannes")]
            STORAGE_LOCAL[("📁 Répertoire Disque /uploads<br/>• Stockage des visuels et affiches")]
            CF_DAEMON["🛡️ Daemon cloudflared.exe<br/>• Tunnel chiffré sortant sans ouverture de port")]

            APP_SRV --- APP_CLIENT
            APP_SRV --- DB_LOCAL
            APP_SRV --- STORAGE_LOCAL
            APP_SRV --- CF_DAEMON
        end

        SWITCH_LAN["🔀 Routeur / Switch Wi-Fi & LAN MINPOSTEL<br/>(Sous-réseau IP Local: 10.x.x.x ou 192.168.x.x)"]
        
        TV_SCREEN <==>|"Liaison Wi-Fi ou HDMI Direct"| SWITCH_LAN
        PC_ADMIN <==>|"Liaison Réseau LAN"| SWITCH_LAN
        SWITCH_LAN <==>|"Ports 5000 & 5173"| APP_SRV
        SMARTPHONES -.->|"Wi-Fi Visiteur MINPOSTEL"| SWITCH_LAN
    end

    subgraph CLOUD_EXTERNE ["☁️ SERVICES CLOUD & INFRASTRUCTURE DISTANTE"]
        CF_EDGE["🌐 Réseau Anycast Cloudflare<br/>(Passerelle HTTPS sécurisée trycloudflare.com)"]
        SUPABASE_CLOUD[("🐘 Supabase / PostgreSQL Cloud<br/>(Base distante & Synchronisation)")]
        WEATHER_API["☀️ Service Météo (API Météo Yaoundé)"]
    end

    CF_DAEMON ==>|"Tunnel Chiffré TLS Sortant (Port 443)"| CF_EDGE
    CF_EDGE ==>|"Accès 4G/5G hors Wi-Fi"| SMARTPHONES
    APP_SRV -.->|"Pooling HTTPS"| SUPABASE_CLOUD
    APP_SRV -.->|"Requêtes API Météo"| WEATHER_API
```

---

## 8. Guide Pratique pour la Soutenance devant le Tuteur & le Jury

Lors de la présentation de votre projet, voici les **5 arguments d'ingénierie logicielle** clés à mettre en valeur :

1. **Tolérance aux pannes (Fault Tolerance) :**  
   *« Si la connexion Internet du ministère s'interrompt ou si la base SQL distante est inaccessible, le système ne plante jamais. Le moteur de repli asynchrone `store.util.js` bascule instantanément sur le cache local `msd_store.json` sans coupure d'affichage. »*
2. **Réactivité temps réel sub-seconde (<50 ms) :**  
   *« Grâce à l'architecture WebSocket (Socket.IO), le déclenchement d'une alerte ministérielle d'urgence ou la publication d'une réunion modifie l'écran du hall sans qu'aucun rechargement de page (F5) ne soit nécessaire. »*
3. **Respect strict du Bilinguisme d'État :**  
   *« Conformément à la Constitution du Cameroun, tous les contenus sont bilingues. L'écran alterne automatiquement entre le Français et l'Anglais à la fin de chaque rotation de carrousel. »*
4. **Transition physique-numérique sans friction (QR Handover) :**  
   *« L'usager ne télécharge aucune application sur l'App Store ou le Play Store. Il scanne simplement le QR code affiché à l'écran et son navigateur mobile ouvre immédiatement l'itinéraire vers la salle de réunion. »*
5. **Gestion éco-énergétique du matériel :**  
   *« Le système intègre un planificateur d'énergie éteignant l'affichage la nuit (18h00 - 07h00) pour prolonger la durée de vie des dalles d'écran et réduire la consommation électrique du ministère. »*
