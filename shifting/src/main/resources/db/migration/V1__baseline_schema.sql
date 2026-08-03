-- =============================================================================
-- V1__baseline_schema.sql
--
-- PURPOSE
--   Baseline migration for Flyway adoption. Represents the full schema as it
--   existed after being built incrementally via Hibernate ddl-auto=update,
--   including the uq_truck_slot/uq_driver_slot unique constraints previously
--   applied by the now-retired V1__add_booking_slot_unique_constraints.sql
--   (see docs/db/legacy-migrations/ for that file, kept for history).
--
-- HOW THIS IS USED (see spring.flyway.* in application.properties)
--   - Existing, already-populated databases: spring.flyway.baseline-on-migrate
--     + baseline-version=1 records this version as already-applied WITHOUT
--     re-running this DDL — the existing schema is trusted to already match.
--   - Brand-new, empty databases (new dev setup, CI, a fresh prod DB): Flyway
--     runs this script from scratch like any normal migration.
--
-- Tables are ordered so foreign-key dependencies are always created before
-- the tables that reference them.
-- =============================================================================

CREATE TABLE `user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `role` enum('ADMIN','USER') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKob8kqyqqgmefl0aco34akdtpe` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `predefined_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(38,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKr6fld7n7u7it9xs553hjcgn0g` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `trucks` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `capacity_kg` int NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `reg_number` varchar(255) NOT NULL,
  `size` enum('LARGE','MEDIUM','SMALL') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK4oupltwtukspv1p90l3gwexvm` (`reg_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `drivers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `is_active` bit(1) DEFAULT NULL,
  `license_no` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKk8g8tftyclmpgp3a5l0ni1nhk` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `bookings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `distance_km` double DEFAULT NULL,
  `drop_address` varchar(255) DEFAULT NULL,
  `pickup_address` varchar(255) DEFAULT NULL,
  `scheduled_date` date DEFAULT NULL,
  `status` enum('CANCELLED','COMPLETED','CONFIRMED','IN_PROGRESS','PENDING') DEFAULT NULL,
  `time_slot` enum('EVENING','MORNING') DEFAULT NULL,
  `total_amount` decimal(38,2) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK65bh1tn1y443fxcah5u36e8fy` (`user_id`),
  CONSTRAINT `FK65bh1tn1y443fxcah5u36e8fy` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `booking_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `custom_name` varchar(255) DEFAULT NULL,
  `price` decimal(38,2) NOT NULL,
  `quantity` int NOT NULL,
  `size` enum('LARGE','MEDIUM','SMALL') DEFAULT NULL,
  `booking_id` bigint NOT NULL,
  `predefined_item_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKrw74irmyat5c39cnjkn02u99m` (`booking_id`),
  KEY `FKr9wob25s7odo79q90dtp23qlu` (`predefined_item_id`),
  CONSTRAINT `FKr9wob25s7odo79q90dtp23qlu` FOREIGN KEY (`predefined_item_id`) REFERENCES `predefined_items` (`id`),
  CONSTRAINT `FKrw74irmyat5c39cnjkn02u99m` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `booking_slots` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `slot_date` date NOT NULL,
  `time_slot` enum('EVENING','MORNING') NOT NULL,
  `booking_id` bigint NOT NULL,
  `driver_id` bigint NOT NULL,
  `truck_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_truck_slot` (`truck_id`,`slot_date`,`time_slot`),
  UNIQUE KEY `uq_driver_slot` (`driver_id`,`slot_date`,`time_slot`),
  UNIQUE KEY `UK13k01yh57kj87l21uyf0ig8fk` (`booking_id`),
  CONSTRAINT `FKfbxpy4ovy5hh9e1f9vyolha2x` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  CONSTRAINT `FKk4gr59n03wwriotb2dl1kf3fx` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`),
  CONSTRAINT `FKl9ufwq98asrpm6j2gmdat21t9` FOREIGN KEY (`truck_id`) REFERENCES `trucks` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(38,2) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `currency` varchar(255) NOT NULL,
  `payment_method` varchar(255) DEFAULT NULL,
  `razorpay_order_id` varchar(255) NOT NULL,
  `razorpay_payment_id` varchar(255) DEFAULT NULL,
  `razorpay_signature` varchar(255) DEFAULT NULL,
  `status` enum('CREATED','FAILED','SUCCESS') NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `booking_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKc3w49re3w3eiexjdnm9khcsd8` (`razorpay_order_id`),
  KEY `FKc52o2b1jkxttngufqp3t7jr3h` (`booking_id`),
  CONSTRAINT `FKc52o2b1jkxttngufqp3t7jr3h` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
