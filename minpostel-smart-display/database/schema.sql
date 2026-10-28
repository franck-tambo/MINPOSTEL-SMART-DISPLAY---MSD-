-- ============================================================
-- MINPOSTEL SMART DISPLAY (MSD) - DATABASE SCHEMA (V1)
-- Database Name: msd_db
-- Target DB Engine: MySQL 8.0+ / MariaDB 10.5+
-- ============================================================

CREATE DATABASE IF NOT EXISTS `msd_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `msd_db`;

-- Drop existing tables in reverse dependency order
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `activity_logs`;
DROP TABLE IF EXISTS `urgent_messages`;
DROP TABLE IF EXISTS `staff_communications`;
DROP TABLE IF EXISTS `events`;
DROP TABLE IF EXISTS `meetings`;
DROP TABLE IF EXISTS `announcements`;
DROP TABLE IF EXISTS `media`;
DROP TABLE IF EXISTS `display_screens`;
DROP TABLE IF EXISTS `rooms`;
DROP TABLE IF EXISTS `floors`;
DROP TABLE IF EXISTS `buildings`;
DROP TABLE IF EXISTS `system_settings`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `roles`;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- 1. ROLES TABLE
-- ------------------------------------------------------------
CREATE TABLE `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `description` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. USERS TABLE
-- ------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `role_id` INT NOT NULL,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `last_login` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. BUILDINGS TABLE
-- ------------------------------------------------------------
CREATE TABLE `buildings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name_fr` VARCHAR(150) NOT NULL,
  `name_en` VARCHAR(150) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. FLOORS TABLE
-- ------------------------------------------------------------
CREATE TABLE `floors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `building_id` INT NOT NULL,
  `floor_number` INT NOT NULL,
  `name_fr` VARCHAR(100) NOT NULL,
  `name_en` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`building_id`) REFERENCES `buildings`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. ROOMS TABLE
-- ------------------------------------------------------------
CREATE TABLE `rooms` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `floor_id` INT NOT NULL,
  `room_number` VARCHAR(50) NOT NULL,
  `name_fr` VARCHAR(150) NOT NULL,
  `name_en` VARCHAR(150) NOT NULL,
  `capacity` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`floor_id`) REFERENCES `floors`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 6. DISPLAY SCREENS TABLE
-- ------------------------------------------------------------
CREATE TABLE `display_screens` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `screen_code` VARCHAR(100) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `location_description` VARCHAR(255) NULL,
  `status` ENUM('ONLINE', 'OFFLINE') DEFAULT 'OFFLINE',
  `last_heartbeat` TIMESTAMP NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 7. MEDIA TABLE
-- ------------------------------------------------------------
CREATE TABLE `media` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `filename` VARCHAR(255) NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `file_size` INT NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `language` ENUM('FR', 'EN', 'BOTH') DEFAULT 'BOTH',
  `description` TEXT NULL,
  `uploaded_by` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 8. ANNOUNCEMENTS TABLE
-- ------------------------------------------------------------
CREATE TABLE `announcements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title_fr` VARCHAR(255) NOT NULL,
  `title_en` VARCHAR(255) NOT NULL,
  `description_fr` TEXT NOT NULL,
  `description_en` TEXT NOT NULL,
  `priority` ENUM('NORMAL', 'IMPORTANT', 'URGENT') DEFAULT 'NORMAL',
  `status` ENUM('DRAFT', 'SCHEDULED', 'PUBLISHED', 'EXPIRED') DEFAULT 'DRAFT',
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `start_time` TIME NULL,
  `end_time` TIME NULL,
  `media_id` INT NULL,
  `created_by` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 9. MEETINGS TABLE
-- ------------------------------------------------------------
CREATE TABLE `meetings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title_fr` VARCHAR(255) NOT NULL,
  `title_en` VARCHAR(255) NOT NULL,
  `description_fr` TEXT NULL,
  `description_en` TEXT NULL,
  `date` DATE NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `building_id` INT NOT NULL,
  `floor_id` INT NOT NULL,
  `room_id` INT NOT NULL,
  `participants_info` TEXT NULL,
  `priority` ENUM('NORMAL', 'IMPORTANT', 'URGENT') DEFAULT 'NORMAL',
  `status` ENUM('SCHEDULED', 'UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'SCHEDULED',
  `is_published` TINYINT(1) DEFAULT 1,
  `media_id` INT NULL,
  `created_by` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`building_id`) REFERENCES `buildings`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`floor_id`) REFERENCES `floors`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 10. EVENTS TABLE
-- ------------------------------------------------------------
CREATE TABLE `events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title_fr` VARCHAR(255) NOT NULL,
  `title_en` VARCHAR(255) NOT NULL,
  `description_fr` TEXT NULL,
  `description_en` TEXT NULL,
  `date` DATE NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `building_id` INT NOT NULL,
  `floor_id` INT NOT NULL,
  `room_id` INT NOT NULL,
  `organizer` VARCHAR(150) NULL,
  `target_audience` VARCHAR(150) NULL,
  `priority` ENUM('NORMAL', 'IMPORTANT', 'URGENT') DEFAULT 'NORMAL',
  `status` ENUM('SCHEDULED', 'UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'SCHEDULED',
  `is_published` TINYINT(1) DEFAULT 1,
  `media_id` INT NULL,
  `created_by` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`building_id`) REFERENCES `buildings`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`floor_id`) REFERENCES `floors`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 11. STAFF COMMUNICATIONS TABLE
-- ------------------------------------------------------------
CREATE TABLE `staff_communications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title_fr` VARCHAR(255) NOT NULL,
  `title_en` VARCHAR(255) NOT NULL,
  `content_fr` TEXT NOT NULL,
  `content_en` TEXT NOT NULL,
  `priority` ENUM('NORMAL', 'IMPORTANT', 'URGENT') DEFAULT 'NORMAL',
  `visibility` ENUM('PUBLIC', 'STAFF', 'RESTRICTED') DEFAULT 'PUBLIC',
  `status` ENUM('DRAFT', 'PUBLISHED', 'EXPIRED') DEFAULT 'PUBLISHED',
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `media_id` INT NULL,
  `created_by` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 12. URGENT MESSAGES TABLE
-- ------------------------------------------------------------
CREATE TABLE `urgent_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `message_fr` TEXT NOT NULL,
  `message_en` TEXT NOT NULL,
  `priority` ENUM('HIGH', 'CRITICAL') DEFAULT 'CRITICAL',
  `status` ENUM('ACTIVE', 'INACTIVE', 'EXPIRED') DEFAULT 'ACTIVE',
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `media_id` INT NULL,
  `created_by` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 13. ACTIVITY LOGS TABLE
-- ------------------------------------------------------------
CREATE TABLE `activity_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(100) NOT NULL,
  `entity_id` INT NULL,
  `description` TEXT NOT NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 14. SYSTEM SETTINGS TABLE
-- ------------------------------------------------------------
CREATE TABLE `system_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` TEXT NOT NULL,
  `description` VARCHAR(255) NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INDEXES FOR PERFORMANCE OPTIMIZATION
CREATE INDEX `idx_meetings_date_time` ON `meetings` (`date`, `start_time`, `end_time`, `status`);
CREATE INDEX `idx_events_date_time` ON `events` (`date`, `start_time`, `end_time`, `status`);
CREATE INDEX `idx_announcements_dates` ON `announcements` (`start_date`, `end_date`, `status`);
CREATE INDEX `idx_urgent_messages_status` ON `urgent_messages` (`status`, `start_time`, `end_time`);
