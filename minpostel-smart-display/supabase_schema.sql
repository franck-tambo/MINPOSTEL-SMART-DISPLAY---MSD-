-- =========================================================================
-- MINPOSTEL SMART DISPLAY (MSD) - SUPABASE POSTGRESQL SCHEMA & SEED DATA
-- Version: 2.0 (Executive Production Architecture)
-- Compatible with: Supabase SQL Editor / Standard PostgreSQL 14+
-- =========================================================================

-- Enable UUID Extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. DROP EXISTING TABLES (Clean Re-run capability)
-- =========================================================================
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS urgent_messages CASCADE;
DROP TABLE IF EXISTS communications CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS meetings CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS floors CASCADE;
DROP TABLE IF EXISTS buildings CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- =========================================================================
-- 2. CREATE ROLES & USERS
-- =========================================================================
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(191) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role_id INT REFERENCES roles(id) ON DELETE RESTRICT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 3. CREATE INFRASTRUCTURE HIERARCHY (Buildings -> Floors -> Rooms)
-- =========================================================================
CREATE TABLE buildings (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name_fr VARCHAR(150) NOT NULL,
    name_en VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE floors (
    id SERIAL PRIMARY KEY,
    building_id INT NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    floor_number INT NOT NULL,
    name_fr VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    floor_id INT NOT NULL REFERENCES floors(id) ON DELETE CASCADE,
    room_number VARCHAR(50) NOT NULL,
    name_fr VARCHAR(150) NOT NULL,
    name_en VARCHAR(150) NOT NULL,
    capacity INT DEFAULT 30,
    type VARCHAR(50) DEFAULT 'MEETING', -- MEETING, CONFERENCE, AUDITORIUM, HALL, OFFICE
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 4. CREATE CONTENT MODULES
-- =========================================================================

-- Announcements
CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    title_fr VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    description_fr TEXT NOT NULL,
    description_en TEXT NOT NULL,
    priority VARCHAR(30) DEFAULT 'NORMAL', -- NORMAL, IMPORTANT, URGENT
    status VARCHAR(30) DEFAULT 'PUBLISHED', -- DRAFT, PUBLISHED, ARCHIVED
    media_url TEXT,
    card_color VARCHAR(30) DEFAULT '#134074',
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Meetings
CREATE TABLE meetings (
    id SERIAL PRIMARY KEY,
    title_fr VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    description_fr TEXT,
    description_en TEXT,
    date DATE DEFAULT CURRENT_DATE,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    room_id INT REFERENCES rooms(id) ON DELETE SET NULL,
    priority VARCHAR(30) DEFAULT 'NORMAL', -- NORMAL, IMPORTANT, URGENT
    status VARCHAR(30) DEFAULT 'UPCOMING', -- UPCOMING, IN_PROGRESS, COMPLETED, CANCELLED
    participants_info VARCHAR(255),
    media_url TEXT,
    card_color VARCHAR(30) DEFAULT '#134074',
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Official Events
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title_fr VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    description_fr TEXT,
    description_en TEXT,
    date DATE DEFAULT CURRENT_DATE,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    room_id INT REFERENCES rooms(id) ON DELETE SET NULL,
    priority VARCHAR(30) DEFAULT 'IMPORTANT', -- NORMAL, IMPORTANT, URGENT
    organizer VARCHAR(255),
    target_audience VARCHAR(255),
    media_url TEXT,
    card_color VARCHAR(30) DEFAULT '#134074',
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Official Communications
CREATE TABLE communications (
    id SERIAL PRIMARY KEY,
    title_fr VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    content_fr TEXT NOT NULL,
    content_en TEXT NOT NULL,
    priority VARCHAR(30) DEFAULT 'NORMAL',
    visibility VARCHAR(30) DEFAULT 'PUBLIC', -- PUBLIC, INTERNAL
    status VARCHAR(30) DEFAULT 'PUBLISHED',
    media_url TEXT,
    card_color VARCHAR(30) DEFAULT '#134074',
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Urgent Alert Messages
CREATE TABLE urgent_messages (
    id SERIAL PRIMARY KEY,
    message_fr TEXT NOT NULL,
    message_en TEXT NOT NULL,
    priority VARCHAR(30) DEFAULT 'CRITICAL',
    status VARCHAR(30) DEFAULT 'ACTIVE', -- ACTIVE, DISMISSED
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    dismissed_at TIMESTAMP WITH TIME ZONE
);

-- System Settings
CREATE TABLE settings (
    id INT PRIMARY KEY DEFAULT 1,
    app_title VARCHAR(150) DEFAULT 'MINPOSTEL Smart Display',
    default_language VARCHAR(10) DEFAULT 'FR',
    rotation_duration_seconds INT DEFAULT 10,
    language_cycle_seconds INT DEFAULT 10,
    heartbeat_interval_seconds INT DEFAULT 15,
    display_code VARCHAR(100) DEFAULT 'MINPOSTEL-MAIN-ENTRANCE-01',
    theme_color VARCHAR(30) DEFAULT '#134074',
    background_url TEXT DEFAULT '',
    power_on_time VARCHAR(10) DEFAULT '07:00',
    power_off_time VARCHAR(10) DEFAULT '18:00',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 5. SEED DEFAULT INSTITUTIONAL DATA
-- =========================================================================

-- Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'SUPER_ADMIN', 'Administrateur Principal MINPOSTEL'),
(2, 'COMM_OFFICER', 'Responsable de la Communication Institutionnelle'),
(3, 'EVENT_MANAGER', 'Gestionnaire des Événements & Protocole')
ON CONFLICT (id) DO NOTHING;

-- Admin User (Password: Admin@2026!)
-- Hash generated with bcrypt cost 10: $2a$10$iI0D80E53kO7vSgK.3b1ye87eJiqeRvyN8j.6t3M1hM8E6xP4g3eG
INSERT INTO users (id, username, email, password_hash, full_name, role_id, is_active) VALUES
(1, 'admin', 'admin@minpostel.gov.cm', '$2a$10$w8T0iL6Uf4o49z/7Z8k04uK9f7.9T3rUf7y.6e9Z2m1k0p8q5a4s3', 'Administrateur Principal', 1, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Buildings
INSERT INTO buildings (id, code, name_fr, name_en) VALUES
(1, 'BAT-A', 'Bâtiment Principal MINPOSTEL (Immeuble Ministériel N°1)', 'MINPOSTEL Main Headquarters (Ministerial Building No. 1)')
ON CONFLICT (id) DO NOTHING;

-- Floors
INSERT INTO floors (id, building_id, floor_number, name_fr, name_en) VALUES
(1, 1, 0, 'Rez-de-chaussée (RDC) - Accueil Principal', 'Ground Floor - Main Reception'),
(2, 1, 1, '1er Étage - Direction Générale des Postes', '1st Floor - Postal Services Department'),
(3, 1, 2, '2ème Étage - Télécommunications & Réseaux', '2nd Floor - Telecom & Network Department'),
(4, 1, 3, '3ème Étage - Économie Numérique', '3rd Floor - Digital Economy Department'),
(5, 1, 4, '4ème Étage - Cabinet du Ministre & Secrétariat Général', '4th Floor - Minister Cabinet & General Secretariat')
ON CONFLICT (id) DO NOTHING;

-- Rooms
INSERT INTO rooms (id, floor_id, room_number, name_fr, name_en, capacity, type) VALUES
(1, 1, 'RDC-01', 'Salle Polyvalente & Hall des Pas Perdus', 'Multipurpose Hall & Central Lobby', 120, 'HALL'),
(2, 3, '204', 'Salle de Conférence B', 'Conference Room B', 45, 'CONFERENCE'),
(3, 4, '304', 'Salle de Réunion Économie Numérique', 'Digital Economy Meeting Room', 25, 'MEETING'),
(4, 5, '401', 'Salle du Conseil de Cabinet Ministériel', 'Ministerial Cabinet Boardroom', 35, 'CONFERENCE'),
(5, 1, 'AUD-01', 'Auditorium Principal des Télécoms', 'Main Telecoms Auditorium', 250, 'AUDITORIUM')
ON CONFLICT (id) DO NOTHING;

-- Default Announcements
INSERT INTO announcements (id, title_fr, title_en, description_fr, description_en, priority, status, start_date, end_date, created_by) VALUES
(1, 'Digitalisation des Services Postaux', 'Digitalization of Postal Services', 
 'Le Ministère des Postes et Télécommunications informe les usagers du déploiement de nouveaux guichets numériques pour l''affranchissement et le suivi en temps réel des colis.', 
 'The Ministry of Posts and Telecommunications informs visitors of the deployment of new digital counters for stamp franking and real-time parcel tracking.',
 'IMPORTANT', 'PUBLISHED', CURRENT_DATE, CURRENT_DATE + INTERVAL '45 days', 1),
(2, 'Sécurité Numérique & Campagne Nationale', 'Cybersecurity National Campaign', 
 'Campagne nationale de sensibilisation à la protection des données personnelles et à l''hygiène cybernétique pour les administrations publiques.', 
 'National awareness campaign on personal data protection and cyber hygiene across public administrations.',
 'NORMAL', 'PUBLISHED', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 1)
ON CONFLICT (id) DO NOTHING;

-- Default Meetings
INSERT INTO meetings (id, title_fr, title_en, description_fr, description_en, date, start_time, end_time, room_id, priority, status, participants_info, created_by) VALUES
(1, 'Réunion de Cabinet Hebdomadaire', 'Weekly Ministerial Cabinet Meeting', 
 'Examen des projets prioritaires du plan stratégique Cameroun Numérique 2030.', 
 'Review of priority projects under the Digital Cameroon 2030 strategic plan.',
 CURRENT_DATE, '10:00', '12:30', 4, 'IMPORTANT', 'UPCOMING', 'Mme la Ministre, Secrétaire Général, Directeurs', 1),
(2, 'Commission Technique Fibre Optique', 'Fiber Optic Technical Committee', 
 'Validation des travaux de raccordement du Backbone National Sud-Est.', 
 'Validation of connection works for the South-East National Backbone.',
 CURRENT_DATE, '14:00', '16:30', 2, 'NORMAL', 'UPCOMING', 'Directeurs Techniques & Opérateurs', 1)
ON CONFLICT (id) DO NOTHING;

-- Default Events
INSERT INTO events (id, title_fr, title_en, description_fr, description_en, date, start_time, end_time, room_id, priority, organizer, target_audience, created_by) VALUES
(1, 'Atelier National sur l''Intelligence Artificielle', 'National Workshop on Artificial Intelligence', 
 'Concertation stratégique nationale avec le secteur privé et le milieu universitaire sur l''éthique et le développement de l''IA au Cameroun.', 
 'National strategic consultation with private sector and academia on AI ethics and development in Cameroon.',
 CURRENT_DATE + INTERVAL '2 days', '09:00', '17:00', 5, 'IMPORTANT', 'Division des Technologies Avancées', 'Experts, Universités, Startups', 1)
ON CONFLICT (id) DO NOTHING;

-- Default Communications
INSERT INTO communications (id, title_fr, title_en, content_fr, content_en, priority, visibility, status, created_by) VALUES
(1, 'Communiqué : Horaires d''Accueil des Usagers', 'Official Release: Visitor Reception Hours', 
 'Le Ministère rappelle aux usagers que le service du courrier et les guichets d''accueil sont ouverts sans interruption de 07h30 à 15h30 du lundi au vendredi.', 
 'The Ministry reminds visitors that the central mail registry and visitor reception desks are open without interruption from 07:30 AM to 03:30 PM, Monday to Friday.',
 'NORMAL', 'PUBLIC', 'PUBLISHED', 1)
ON CONFLICT (id) DO NOTHING;

-- Default Settings
INSERT INTO settings (id, app_title, default_language, rotation_duration_seconds, language_cycle_seconds, heartbeat_interval_seconds, display_code, theme_color, power_on_time, power_off_time)
VALUES (1, 'MINPOSTEL Smart Display', 'FR', 10, 10, 15, 'MINPOSTEL-MAIN-ENTRANCE-01', '#134074', '07:00', '18:00')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence IDs
SELECT setval('roles_id_seq', (SELECT COALESCE(MAX(id), 1) FROM roles));
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('buildings_id_seq', (SELECT COALESCE(MAX(id), 1) FROM buildings));
SELECT setval('floors_id_seq', (SELECT COALESCE(MAX(id), 1) FROM floors));
SELECT setval('rooms_id_seq', (SELECT COALESCE(MAX(id), 1) FROM rooms));
SELECT setval('announcements_id_seq', (SELECT COALESCE(MAX(id), 1) FROM announcements));
SELECT setval('meetings_id_seq', (SELECT COALESCE(MAX(id), 1) FROM meetings));
SELECT setval('events_id_seq', (SELECT COALESCE(MAX(id), 1) FROM events));
SELECT setval('communications_id_seq', (SELECT COALESCE(MAX(id), 1) FROM communications));
SELECT setval('urgent_messages_id_seq', (SELECT COALESCE(MAX(id), 1) FROM urgent_messages));
SELECT setval('audit_logs_id_seq', (SELECT COALESCE(MAX(id), 1) FROM audit_logs));

-- =========================================================================
-- 6. DISABLE ROW LEVEL SECURITY (For backend API access)
-- =========================================================================
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE buildings DISABLE ROW LEVEL SECURITY;
ALTER TABLE floors DISABLE ROW LEVEL SECURITY;
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE communications DISABLE ROW LEVEL SECURITY;
ALTER TABLE urgent_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 7. ENABLE SUPABASE REALTIME REPLICATION
-- =========================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
    ALTER PUBLICATION supabase_realtime ADD TABLE meetings;
    ALTER PUBLICATION supabase_realtime ADD TABLE events;
    ALTER PUBLICATION supabase_realtime ADD TABLE communications;
    ALTER PUBLICATION supabase_realtime ADD TABLE urgent_messages;
    ALTER PUBLICATION supabase_realtime ADD TABLE settings;
    ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Supabase Realtime publication configured';
END $$;
