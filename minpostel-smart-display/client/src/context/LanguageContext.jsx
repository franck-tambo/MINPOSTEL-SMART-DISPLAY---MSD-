import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  FR: {
    // Navigation & Layout
    dashboard: 'Tableau de bord',
    announcements: 'Annonces',
    meetings: 'Réunions',
    events: 'Événements',
    communications: 'Communications',
    urgentMessages: 'Messages urgents',
    locations: 'Bâtiments',
    displayPreview: 'Écran principal',
    activityLogs: "Journal d'activités",
    settings: 'Paramètres',
    logout: 'Déconnexion',
    adminRole: 'ADMINISTRATEUR',
    superAdminRole: 'SUPER ADMINISTRATEUR',
    launchScreen: "Lancer l'écran physique",
    screenStatusOnline: 'Statut Écran : EN LIGNE',
    screenStatusConnecting: 'Statut Écran : CONNEXION...',
    screenStatusOffline: 'Statut Écran : HORS LIGNE',
    adminTitle: 'MINPOSTEL Smart Display',
    adminSubtitle: 'Système de gestion et affichage dynamique',
    darkMode: 'Mode Sombre',
    lightMode: 'Mode Clair',
    switchToDark: 'Passer en Mode Sombre',
    switchToLight: 'Passer en Mode Clair',

    // Common Actions & Labels
    create: 'Créer',
    new: 'Nouveau',
    edit: 'Modifier',
    delete: 'Supprimer',
    save: 'Enregistrer',
    cancel: 'Annuler',
    publish: 'Publier',
    unpublish: 'Dépublier',
    search: 'Rechercher...',
    filterAll: 'Tous',
    actions: 'Actions',
    status: 'Statut',
    priority: 'Priorité',
    date: 'Date',
    time: 'Heure',
    location: 'Lieu',
    room: 'Salle',
    floor: 'Étage',
    building: 'Bâtiment',
    audience: 'Audience',
    media: 'Média (Image ou Vidéo)',
    uploadMedia: 'Téléverser une image ou vidéo',
    mediaDropHint: 'Glissez-déposez ou cliquez pour sélectionner (JPG, PNG, WEBP, MP4, max 25Mo)',
    removeMedia: 'Supprimer le média',
    loading: 'Chargement...',
    confirmDelete: 'Êtes-vous certain de vouloir supprimer cet élément ?',
    noData: 'Aucun enregistrement trouvé',
    allRightsReserved: 'Tous droits réservés.',

    // Priority & Status
    priorityUrgent: 'URGENT',
    priorityImportant: 'IMPORTANT',
    priorityNormal: 'NORMAL',
    statusPublished: 'PUBLIÉ',
    statusDraft: 'BROUILLON',
    statusScheduled: 'PROGRAMMÉ',
    statusInProgress: 'EN COURS',
    statusCompleted: 'TERMINÉ',
    statusCancelled: 'ANNULÉ',

    // Dashboard Overview
    welcomeTitle: "Gestion de l'Affichage Dynamique MINPOSTEL",
    welcomeBadge: 'Panneau de Contrôle Central',
    welcomeDesc: "Supervisez les annonces, réunions du jour et diffusions en temps réel sur l'écran du Rez-de-Chaussée (Entrée Principale).",
    btnScheduleMeeting: 'Programmer Réunion',
    btnNewCommunication: 'Nouvelle Communication',
    btnUrgentAlert: 'Message Urgent',
    activeAnnouncements: 'Annonces Actives',
    activeAnnouncementsSub: 'Diffusées sur écran principal',
    upcomingMeetings: 'Réunions à venir',
    upcomingMeetingsSub: "Programmées aujourd'hui",
    todayEvents: "Événements du jour",
    todayEventsSub: 'Amphithéâtre & Hall',
    activeUrgent: 'Messages Urgents',
    activeUrgentSub: 'Alertes actives en cours',
    totalCommunications: 'Communications',
    totalCommunicationsSub: 'Personnel & Visiteurs',
    screenHealth: 'Statut Écran RDC',
    seeAll: 'Voir toutes →',
    todayMeetingsOnScreen: "Réunions du Jour sur l'Écran Entrée",
    activeAnnouncementsWidget: 'Annonces & Campagnes en Diffusion',
    quickActionsTitle: 'Raccourcis & Actions Rapides',
    previewDisplayDesc: "Visualisez exactement ce qui est diffusé en ce moment sur l'écran physique à l'accueil.",
    openKioskPreview: "Ouvrir l'Aperçu Écran",

    // Communications Page
    commsTitle: 'Communications & Notes de Service',
    commsDesc: 'Gestion et diffusion des consignes, notes de service et communications institutionnelles.',
    newCommBtn: '+ Nouvelle Communication',
    editCommTitle: 'Modifier la Communication',
    createCommTitle: 'Créer une Nouvelle Communication',
    targetPublic: 'PUBLIC (Écran & Accueil)',
    targetInternal: 'INTERNE (Personnel & Cadres)',
    targetAll: 'TOUS PUBLICS',

    // Form fields
    titleFr: 'Titre (Français)',
    titleEn: 'Title (English)',
    descFr: 'Description / Contenu (Français)',
    descEn: 'Description / Content (English)',
    startDate: 'Date de début',
    endDate: 'Date de fin',
    startTime: 'Heure de début',
    endTime: 'Heure de fin',
    organizer: 'Organisateur / Responsable',
    category: 'Catégorie',
    visibility: 'Visibilité',

    // Location Management
    locationsTitle: 'Gestion des Bâtiments & Espaces',
    locationsSubtitle: 'Structure des bâtiments, étages, salles de réunion et capacité des amphithéâtres/conférences.',
    btnAddBuilding: '+ Nouveau Bâtiment',
    btnAddFloor: '+ Ajouter un Étage / Niveau',
    btnAddRoom: '+ Ajouter une Salle / Espace',
    editFloorTitle: "Modifier l'Étage / Niveau",
    createFloorTitle: 'Créer un Nouvel Étage / Niveau',
    editRoomTitle: "Modifier la Salle / Espace",
    createRoomTitle: 'Créer une Nouvelle Salle / Espace',
    floorNumberLabel: 'Numéro de Niveau (0 = RDC, 1 = 1er, -1 = Sous-sol)',
    roomTypeLabel: "Type d'espace",
    roomCapacityLabel: 'Capacité (Nombre de places assises)',
    modifyCapacityBtn: 'Modifier la Capacité',
    quickCapacityTitle: 'Ajuster la Capacité en Places',
    totalBuildingsMetric: 'Bâtiments',
    totalFloorsMetric: 'Étages / Niveaux',
    totalRoomsMetric: 'Salles & Espaces',
    totalCapacityMetric: 'Capacité Totale Réunie',
    roomTypeConference: 'Salle de Conférence',
    roomTypeAuditorium: 'Amphithéâtre',
    roomTypeMeeting: 'Salle de Réunion',
    roomTypeHall: 'Hall Polyvalent / Accueil',
    roomTypeOffice: 'Bureau / Direction',
    searchLocationsPlaceholder: 'Rechercher un bâtiment, salle, code ou étage...',

    // Notifications
    successSaved: 'Enregistré avec succès !',
    successDeleted: 'Supprimé avec succès !',
    uploadSuccess: 'Média téléversé avec succès !',
    uploadError: 'Erreur lors du téléversement du média.'
  },
  EN: {
    // Navigation & Layout
    dashboard: 'Dashboard',
    announcements: 'Announcements',
    meetings: 'Meetings',
    events: 'Events',
    communications: 'Communications',
    urgentMessages: 'Urgent Messages',
    locations: 'Buildings',
    displayPreview: 'Display Preview',
    activityLogs: 'Activity Logs',
    settings: 'Settings',
    logout: 'Sign Out',
    adminRole: 'ADMINISTRATOR',
    superAdminRole: 'SUPER ADMINISTRATOR',
    launchScreen: 'Launch Physical Display',
    screenStatusOnline: 'Screen Status: ONLINE',
    screenStatusConnecting: 'Screen Status: CONNECTING...',
    screenStatusOffline: 'Screen Status: OFFLINE',
    adminTitle: 'MINPOSTEL Smart Display',
    adminSubtitle: 'Digital signage & information system',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    switchToDark: 'Switch to Dark Mode',
    switchToLight: 'Switch to Light Mode',

    // Common Actions & Labels
    create: 'Create',
    new: 'New',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    publish: 'Publish',
    unpublish: 'Unpublish',
    search: 'Search...',
    filterAll: 'All',
    actions: 'Actions',
    status: 'Status',
    priority: 'Priority',
    date: 'Date',
    time: 'Time',
    location: 'Location',
    room: 'Room',
    floor: 'Floor',
    building: 'Building',
    audience: 'Audience',
    media: 'Media (Image or Video)',
    uploadMedia: 'Upload image or video',
    mediaDropHint: 'Drag & drop or click to upload (JPG, PNG, WEBP, MP4, max 25MB)',
    removeMedia: 'Remove media',
    loading: 'Loading...',
    confirmDelete: 'Are you sure you want to delete this item?',
    noData: 'No records found',
    allRightsReserved: 'All rights reserved.',

    // Priority & Status
    priorityUrgent: 'URGENT',
    priorityImportant: 'IMPORTANT',
    priorityNormal: 'NORMAL',
    statusPublished: 'PUBLISHED',
    statusDraft: 'DRAFT',
    statusScheduled: 'SCHEDULED',
    statusInProgress: 'IN PROGRESS',
    statusCompleted: 'COMPLETED',
    statusCancelled: 'CANCELLED',

    // Dashboard Overview
    welcomeTitle: 'MINPOSTEL Smart Display Management',
    welcomeBadge: 'Central Control Panel',
    welcomeDesc: 'Supervise announcements, daily meetings, and real-time broadcasts on the Ground Floor Entrance digital screen.',
    btnScheduleMeeting: 'Schedule Meeting',
    btnNewCommunication: 'New Communication',
    btnUrgentAlert: 'Urgent Alert',
    activeAnnouncements: 'Active Announcements',
    activeAnnouncementsSub: 'Broadcasting on lobby display',
    upcomingMeetings: 'Upcoming Meetings',
    upcomingMeetingsSub: 'Scheduled for today',
    todayEvents: "Today's Events",
    todayEventsSub: 'Auditorium & Lobby',
    activeUrgent: 'Urgent Messages',
    activeUrgentSub: 'Active broadcasts right now',
    totalCommunications: 'Communications',
    totalCommunicationsSub: 'Staff & Visitors',
    screenHealth: 'Lobby Screen Status',
    seeAll: 'View all →',
    todayMeetingsOnScreen: "Today's Meetings on Lobby Screen",
    activeAnnouncementsWidget: 'Active Announcements & Campaigns',
    quickActionsTitle: 'Shortcuts & Quick Actions',
    previewDisplayDesc: 'See exactly what is currently broadcast on the physical kiosk display in the lobby.',
    openKioskPreview: 'Open Display Preview',

    // Communications Page
    commsTitle: 'Communications & Service Memos',
    commsDesc: 'Management and broadcast of institutional directives, staff notices and public guidelines.',
    newCommBtn: '+ New Communication',
    editCommTitle: 'Edit Communication',
    createCommTitle: 'Create New Communication',
    targetPublic: 'PUBLIC (Lobby Display)',
    targetInternal: 'INTERNAL (Staff & Officials)',
    targetAll: 'ALL AUDIENCES',

    // Form fields
    titleFr: 'Title (French)',
    titleEn: 'Title (English)',
    descFr: 'Description / Content (French)',
    descEn: 'Description / Content (English)',
    startDate: 'Start Date',
    endDate: 'End Date',
    startTime: 'Start Time',
    endTime: 'End Time',
    organizer: 'Organizer / Chairperson',
    category: 'Category',
    visibility: 'Visibility',

    // Location Management
    locationsTitle: 'Buildings & Spaces Management',
    locationsSubtitle: 'Ministry building structures, floors, meeting rooms, and conference/auditorium capacities.',
    btnAddBuilding: '+ New Building',
    btnAddFloor: '+ Add Floor / Level',
    btnAddRoom: '+ Add Room / Space',
    editFloorTitle: 'Edit Floor / Level',
    createFloorTitle: 'Create New Floor / Level',
    editRoomTitle: 'Edit Room / Space',
    createRoomTitle: 'Create New Room / Space',
    floorNumberLabel: 'Level Number (0 = Ground Floor, 1 = 1st, -1 = Basement)',
    roomTypeLabel: 'Space Type',
    roomCapacityLabel: 'Capacity (Seating capacity)',
    modifyCapacityBtn: 'Modify Capacity',
    quickCapacityTitle: 'Quick Adjust Seating Capacity',
    totalBuildingsMetric: 'Buildings',
    totalFloorsMetric: 'Floors / Levels',
    totalRoomsMetric: 'Rooms & Spaces',
    totalCapacityMetric: 'Total Combined Capacity',
    roomTypeConference: 'Conference Hall',
    roomTypeAuditorium: 'Auditorium',
    roomTypeMeeting: 'Meeting Room',
    roomTypeHall: 'Multipurpose / Reception Hall',
    roomTypeOffice: 'Office / Department',
    searchLocationsPlaceholder: 'Search building, room, code, or floor...',

    // Notifications
    successSaved: 'Saved successfully!',
    successDeleted: 'Deleted successfully!',
    uploadSuccess: 'Media uploaded successfully!',
    uploadError: 'Error uploading media file.'
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('msd_language') || 'FR';
  });

  const setLanguage = (lang) => {
    const nextLang = lang === 'EN' ? 'EN' : 'FR';
    setLanguageState(nextLang);
    localStorage.setItem('msd_language', nextLang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'FR' ? 'EN' : 'FR');
  };

  const t = (key) => {
    const dict = translations[language] || translations.FR;
    return dict[key] || translations.FR[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
