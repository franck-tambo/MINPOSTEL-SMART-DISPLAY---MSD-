-- ============================================================
-- MINPOSTEL SMART DISPLAY (MSD) - SEED DATA (V1)
-- ============================================================

USE `msd_db`;

-- Disable Foreign Keys for Seed Insert
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `activity_logs`;
TRUNCATE TABLE `urgent_messages`;
TRUNCATE TABLE `staff_communications`;
TRUNCATE TABLE `events`;
TRUNCATE TABLE `meetings`;
TRUNCATE TABLE `announcements`;
TRUNCATE TABLE `media`;
TRUNCATE TABLE `display_screens`;
TRUNCATE TABLE `rooms`;
TRUNCATE TABLE `floors`;
TRUNCATE TABLE `buildings`;
TRUNCATE TABLE `system_settings`;
TRUNCATE TABLE `users`;
TRUNCATE TABLE `roles`;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. SEED ROLES
INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'SUPER_ADMIN', 'Administrateur Principal MINPOSTEL'),
(2, 'CONTENT_MANAGER', 'Gestionnaire de contenu et d\'affichage');

-- 2. SEED ADMIN USER (password: admin123 -> bcrypt hash)
INSERT INTO `users` (`id`, `role_id`, `username`, `email`, `password_hash`, `full_name`, `is_active`) VALUES
(1, 1, 'admin', 'admin@minpostel.gov.cm', '$2a$10$b5.qH97tVjWJbAFAfE.4u.6S1/tT9S4XJ4u5O5J5S5S5S5S5S5S5S', 'Administrateur Principal', 1);

-- 3. SEED BUILDINGS
INSERT INTO `buildings` (`id`, `code`, `name_fr`, `name_en`) VALUES
(1, 'MAIN_BLDG', 'Bâtiment Principal', 'Main Building'),
(2, 'ANNEX_BLDG', 'Bâtiment Annexe A', 'Annex Building A');

-- 4. SEED FLOORS
INSERT INTO `floors` (`id`, `building_id`, `floor_number`, `name_fr`, `name_en`) VALUES
(1, 1, 0, 'Rez-de-Chaussée', 'Ground Floor'),
(2, 1, 1, '1er Étage', '1st Floor'),
(3, 1, 2, '2e Étage', '2nd Floor'),
(4, 2, 1, '1er Étage Annexe', '1st Floor Annex');

-- 5. SEED ROOMS
INSERT INTO `rooms` (`id`, `floor_id`, `room_number`, `name_fr`, `name_en`, `capacity`) VALUES
(1, 1, 'RDC-01', 'Salle d\'Accueil / Réception', 'Reception / Information Desk', 30),
(2, 3, 'CONF-B', 'Salle de Conférence B', 'Conference Room B', 80),
(3, 3, 'CABINET-01', 'Salle de Réunion du Cabinet', 'Cabinet Meeting Room', 25),
(4, 2, 'AUDIT-A', 'Amphithéâtre Principal', 'Main Auditorium', 200);

-- 6. SEED DISPLAY SCREEN
INSERT INTO `display_screens` (`id`, `screen_code`, `name`, `location_description`, `status`) VALUES
(1, 'MINPOSTEL-MAIN-ENTRANCE-01', 'Écran Entrée Principale RDC', 'Hall d\'entrée principal en face du poste de garde', 'ONLINE');

-- 7. SEED ANNOUNCEMENTS
INSERT INTO `announcements` (`id`, `title_fr`, `title_en`, `description_fr`, `description_en`, `priority`, `status`, `start_date`, `end_date`, `created_by`) VALUES
(1, 
'Digitalisation des Services Postaux', 
'Digitalization of Postal Services', 
'Le Ministère des Postes et Télécommunications informe le public du lancement de la nouvelle plateforme de gestion numérique.', 
'The Ministry of Posts and Telecommunications informs the public of the launch of the new digital management platform.', 
'IMPORTANT', 'PUBLISHED', CURRENT_DATE(), DATE_ADD(CURRENT_DATE(), INTERVAL 30 DAY), 1),
(2, 
'Horaires d\'Ouverture Spéciaux', 
'Special Opening Hours', 
'Les services du ministère seront ouverts de 07h30 à 15h30 pendant la période de concertation nationale.', 
'Ministry services will be open from 07:30 AM to 03:30 PM during the national consultation period.', 
'NORMAL', 'PUBLISHED', CURRENT_DATE(), DATE_ADD(CURRENT_DATE(), INTERVAL 14 DAY), 1);

-- 8. SEED MEETINGS
INSERT INTO `meetings` (`id`, `title_fr`, `title_en`, `description_fr`, `description_en`, `date`, `start_time`, `end_time`, `building_id`, `floor_id`, `room_id`, `participants_info`, `priority`, `status`, `is_published`, `created_by`) VALUES
(1, 
'Réunion de Coordination du Cabinet', 
'Cabinet Coordination Meeting', 
'Examen des projets prioritaires du secteur des télécommunications.', 
'Review of priority projects in the telecommunications sector.', 
CURRENT_DATE(), '14:00:00', '16:00:00', 1, 3, 2, 'Membres du Cabinet & Directeurs Centraux', 'URGENT', 'UPCOMING', 1, 1),
(2, 
'Session de Travail Sécurité Numérique', 
'Digital Security Working Session', 
'Évaluation des infrastructures stratégiques nationales.', 
'Assessment of national strategic infrastructures.', 
CURRENT_DATE(), '16:30:00', '18:00:00', 1, 3, 3, 'Experts en Cybersécurité & ART', 'IMPORTANT', 'SCHEDULED', 1, 1);

-- 9. SEED EVENTS
INSERT INTO `events` (`id`, `title_fr`, `title_en`, `description_fr`, `description_en`, `date`, `start_time`, `end_time`, `building_id`, `floor_id`, `room_id`, `organizer`, `target_audience`, `priority`, `status`, `is_published`, `created_by`) VALUES
(1, 
'Conférence sur la Transformation Numérique', 
'Digital Transformation Conference', 
'Présentation des nouvelles directives pour l\'économie numérique au Cameroun.', 
'Presentation of new guidelines for the digital economy in Cameroon.', 
CURRENT_DATE(), '09:00:00', '12:00:00', 1, 2, 4, 'Direction Générale de l\'Économie Numérique', 'Public & Partenaires', 'IMPORTANT', 'COMPLETED', 1, 1);

-- 10. SEED STAFF COMMUNICATIONS
INSERT INTO `staff_communications` (`id`, `title_fr`, `title_en`, `content_fr`, `content_en`, `priority`, `visibility`, `status`, `start_date`, `end_date`, `created_by`) VALUES
(1, 
'Rappel: Port du Badge Obligatoire', 
'Reminder: Mandatory Badge Wearing', 
'Le port du badge institutionnel est strictement obligatoire pour l\'ensemble des personnels au sein des bâtiments.', 
'Wearing the institutional badge is strictly mandatory for all staff within ministry buildings.', 
'NORMAL', 'PUBLIC', 'PUBLISHED', CURRENT_DATE(), DATE_ADD(CURRENT_DATE(), INTERVAL 60 DAY), 1);

-- 11. SEED SYSTEM SETTINGS
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `description`) VALUES
('app_title', 'MINPOSTEL Smart Display', 'Nom officiel de l\'application'),
('default_language', 'FR', 'Langue par défaut du système'),
('rotation_duration_seconds', '10', 'Durée d\'affichage de chaque diapositive (en secondes)'),
('language_cycle_seconds', '10', 'Intervalle de basculement des langues FR/EN (en secondes)'),
('heartbeat_interval_seconds', '15', 'Fréquence des pings heartbeat du display client'),
('display_code', 'MINPOSTEL-MAIN-ENTRANCE-01', 'Identifiant de l\'écran principal');
