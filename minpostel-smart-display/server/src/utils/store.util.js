import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const STORE_FILE = path.join(DATA_DIR, 'msd_store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function getLocalIpAddress() {
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const net of interfaces[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
  } catch (e) {}
  return '192.168.100.64';
}

// Default initial seed data
const defaultData = {
  announcements: [
    {
      id: 1,
      title_fr: 'Digitalisation des Services Postaux',
      title_en: 'Digitalization of Postal Services',
      description_fr: 'Le Ministère des Postes et Télécommunications informe le public du déploiement de nouveaux guichets numériques pour l\'affranchissement.',
      description_en: 'The Ministry of Posts and Telecommunications informs visitors of the deployment of new digital counters.',
      priority: 'IMPORTANT',
      status: 'PUBLISHED',
      start_date: '2026-09-10',
      end_date: '2026-10-10',
      author_name: 'Administrateur Principal'
    }
  ],
  meetings: [
    {
      id: 1,
      title_fr: 'Réunion de Coordination du Cabinet',
      title_en: 'Cabinet Coordination Meeting',
      description_fr: 'Examen des projets prioritaires du secteur des télécommunications.',
      description_en: 'Review of priority projects in the telecommunications sector.',
      date: new Date().toISOString().split('T')[0],
      start_time: '14:00',
      end_time: '16:00',
      building_fr: 'Bâtiment Principal',
      building_en: 'Main Building',
      floor_fr: '2e Étage',
      floor_en: '2nd Floor',
      room_fr: 'Salle de Conférence B',
      room_en: 'Conference Room B',
      participants_info: 'Membres du Cabinet & Directeurs Centraux',
      priority: 'URGENT',
      status: 'UPCOMING',
      is_published: 1
    }
  ],
  events: [
    {
      id: 1,
      title_fr: 'Atelier National sur la Cybersécurité',
      title_en: 'National Cybersecurity Workshop',
      description_fr: 'Renforcement des capacités des administrations publiques.',
      description_en: 'Capacity building for public administration IT staff.',
      date: new Date().toISOString().split('T')[0],
      start_time: '09:00',
      end_time: '12:00',
      building_fr: 'Bâtiment Principal',
      building_en: 'Main Building',
      floor_fr: 'RDC',
      floor_en: 'Ground Floor',
      room_fr: 'Salle Polyvalente',
      room_en: 'Multipurpose Room',
      organizer: 'Division de la Sécurité des Réseaux',
      target_audience: 'Points Focaux SI',
      priority: 'IMPORTANT',
      status: 'SCHEDULED',
      is_published: 1
    }
  ],
  communications: [
    {
      id: 1,
      title_fr: 'Lancement du Portail National des Télécommunications',
      title_en: 'Launch of the National Telecommunications Portal',
      description_fr: 'Madame la Ministre des Postes et Télécommunications a présidé ce jour la cérémonie officielle de mise en service du nouveau portail national.',
      description_en: 'The Minister of Posts and Telecommunications chaired today the official commissioning ceremony of the new national portal.',
      date: new Date().toISOString().split('T')[0],
      publisher: 'Cellule de Communication',
      priority: 'IMPORTANT',
      status: 'PUBLISHED',
      is_published: 1
    }
  ],
  urgentMessages: [],
  settings: {
    app_title: 'MINPOSTEL Smart Display',
    default_language: 'FR',
    rotation_duration_seconds: 10,
    language_cycle_seconds: 10,
    heartbeat_interval_seconds: 15,
    display_code: 'MINPOSTEL-MAIN-ENTRANCE-01',
    theme_color: '#134074',
    background_url: '',
    power_on_time: '07:00',
    power_off_time: '18:00',
    public_base_url: process.env.PUBLIC_URL || ''
  },
  locations: {
    buildings: [
      { id: 1, code: 'MAIN_BLDG', name_fr: 'Bâtiment Principal', name_en: 'Main Building' },
      { id: 2, code: 'ANNEX_BLDG', name_fr: 'Bâtiment Annexe A', name_en: 'Annex Building A' }
    ],
    floors: [
      { id: 1, building_id: 1, floor_number: 0, name_fr: 'Rez-de-Chaussée', name_en: 'Ground Floor' },
      { id: 2, building_id: 1, floor_number: 1, name_fr: '1er Étage', name_en: '1st Floor' },
      { id: 3, building_id: 1, floor_number: 2, name_fr: '2e Étage', name_en: '2nd Floor' },
      { id: 4, building_id: 1, floor_number: 3, name_fr: '3e Étage', name_en: '3rd Floor' },
      { id: 5, building_id: 2, floor_number: 0, name_fr: 'Rez-de-Chaussée Annexe', name_en: 'Annex Ground Floor' }
    ],
    rooms: [
      { id: 1, floor_id: 1, room_number: 'RDC-01', name_fr: 'Hall d\'Accueil / Réception', name_en: 'Main Reception & Welcome Hall', capacity: 50, type: 'HALL' },
      { id: 2, floor_id: 1, room_number: 'RDC-CONF', name_fr: 'Salle de Conférence RDC', name_en: 'Ground Floor Conference Hall', capacity: 120, type: 'CONFERENCE' },
      { id: 3, floor_id: 2, room_number: 'AUDIT-A', name_fr: 'Grand Amphithéâtre des Télécoms', name_en: 'Main Telecom Auditorium', capacity: 250, type: 'AUDITORIUM' },
      { id: 4, floor_id: 2, room_number: 'SALLE-102', name_fr: 'Salle des Commissions Numériques', name_en: 'Digital Commission Meeting Room', capacity: 35, type: 'MEETING' },
      { id: 5, floor_id: 3, room_number: 'CONF-B', name_fr: 'Salle de Conférence B', name_en: 'Conference Room B', capacity: 80, type: 'CONFERENCE' },
      { id: 6, floor_id: 3, room_number: 'CABINET-01', name_fr: 'Salle de Réunion du Cabinet', name_en: 'Cabinet Meeting Room', capacity: 30, type: 'MEETING' },
      { id: 7, floor_id: 4, room_number: 'DIR-401', name_fr: 'Salle de Presse & Média', name_en: 'Press & Media Briefing Room', capacity: 45, type: 'MEETING' },
      { id: 8, floor_id: 5, room_number: 'ANNEX-H01', name_fr: 'Hall Polyvalent Annexe', name_en: 'Annex Multi-purpose Hall', capacity: 70, type: 'HALL' }
    ]
  },
  logs: [
    {
      id: 1792600000001,
      action: 'LOGIN',
      entity_type: 'USER',
      description: 'Connexion de l\'administrateur Principal (admin)',
      user: 'admin',
      ip_address: '127.0.0.1',
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 1792600000002,
      action: 'SETTINGS',
      entity_type: 'CONFIG',
      description: 'Mise à jour des paramètres système (durée des diapositives et intervalle de pulsation)',
      user: 'admin',
      ip_address: '127.0.0.1',
      created_at: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: 1792600000003,
      action: 'UPDATE',
      entity_type: 'BUILDINGS',
      description: 'Synchronisation et structuration de la nomenclature des bâtiments ministériels',
      user: 'admin',
      ip_address: '127.0.0.1',
      created_at: new Date(Date.now() - 900000).toISOString()
    }
  ]
};

let inMemoryStore = { ...defaultData };

// Load persistent data from disk if available
try {
  if (fs.existsSync(STORE_FILE)) {
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    inMemoryStore = { ...defaultData, ...parsed };
    if (!Array.isArray(inMemoryStore.logs) || inMemoryStore.logs.length === 0) {
      inMemoryStore.logs = [...defaultData.logs];
    }
    // Sanitize any invalid or stale trial Cloudflare URL
    if (
      inMemoryStore.settings?.public_base_url?.includes('api.trycloudflare.com') ||
      inMemoryStore.settings?.public_base_url?.includes('beginning-breakdown')
    ) {
      inMemoryStore.settings.public_base_url = '';
    }
    console.log('[STORE] Successfully loaded local persistent state from disk.');
  } else {
    fs.writeFileSync(STORE_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    console.log('[STORE] Initialized fresh local persistent store at:', STORE_FILE);
  }
} catch (e) {
  console.warn('[STORE] Error reading store from disk, using default memory state:', e.message);
}

// Debounced async disk write to guarantee 0ms latency on client operations
let saveTimeout = null;
export function saveStore() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      fs.writeFileSync(STORE_FILE, JSON.stringify(inMemoryStore, null, 2), 'utf-8');
    } catch (e) {
      console.error('[STORE] Failed to persist data to disk:', e.message);
    }
  }, 100);
}

export function recordActivityLog({ action, entity_type, description, user = 'admin', ip_address = '127.0.0.1', req = null, io = null }) {
  const finalUser = (req?.user?.username) || (typeof user === 'string' ? user : 'admin');
  const rawIp = req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || ip_address || '127.0.0.1';
  const cleanIp = String(rawIp).replace('::ffff:', '').split(',')[0].trim();

  const newLog = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    action: String(action || 'ACTION').toUpperCase(),
    entity_type: String(entity_type || 'SYSTEM').toUpperCase(),
    description: description || 'Action administrative enregistrée',
    user: finalUser,
    ip_address: cleanIp,
    created_at: new Date().toISOString()
  };

  if (!Array.isArray(inMemoryStore.logs)) {
    inMemoryStore.logs = [];
  }

  inMemoryStore.logs.unshift(newLog);

  // Keep latest 1000 logs
  if (inMemoryStore.logs.length > 1000) {
    inMemoryStore.logs = inMemoryStore.logs.slice(0, 1000);
  }

  saveStore();

  const socketIo = io || req?.app?.get('io');
  if (socketIo) {
    socketIo.emit('NEW_ACTIVITY_LOG', newLog);
  }

  return newLog;
}

export const store = inMemoryStore;
export default store;
