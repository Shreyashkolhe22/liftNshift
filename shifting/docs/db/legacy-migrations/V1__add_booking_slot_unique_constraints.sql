-- =============================================================================
-- V1__add_booking_slot_unique_constraints.sql
--
-- PURPOSE
--   Guarantee that no two BookingSlot rows can share the same
--   (truck_id, slot_date, time_slot) or (driver_id, slot_date, time_slot).
--
-- WHY THIS IS NEEDED
--   Hibernate ddl-auto=update does NOT reliably add @UniqueConstraint
--   definitions to a pre-existing table.  This script adds the constraints
--   idempotently (only if they are absent) so it is safe to re-run.
--
-- PRE-FLIGHT CHECK — run these queries first and resolve any rows returned:
--
--   SELECT truck_id, slot_date, time_slot, COUNT(*) AS cnt
--   FROM booking_slots
--   GROUP BY truck_id, slot_date, time_slot
--   HAVING cnt > 1;
--
--   SELECT driver_id, slot_date, time_slot, COUNT(*) AS cnt
--   FROM booking_slots
--   GROUP BY driver_id, slot_date, time_slot
--   HAVING cnt > 1;
--
--   If either query returns rows, delete or merge the duplicate rows before
--   running this script, otherwise the ALTER TABLE will fail.
-- =============================================================================

-- ── 1. uq_truck_slot : (truck_id, slot_date, time_slot) ──────────────────────
-- Guard: only add if the constraint is absent from INFORMATION_SCHEMA
SET @db   = DATABASE();
SET @tbl  = 'booking_slots';
SET @idx1 = 'uq_truck_slot';
SET @idx2 = 'uq_driver_slot';

-- MySQL does not support IF NOT EXISTS on ALTER TABLE ADD UNIQUE KEY,
-- so we use a stored procedure trick to check before altering.

DROP PROCEDURE IF EXISTS _add_uq_truck_slot;
DELIMITER //
CREATE PROCEDURE _add_uq_truck_slot()
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM   INFORMATION_SCHEMA.STATISTICS
        WHERE  TABLE_SCHEMA = DATABASE()
          AND  TABLE_NAME   = 'booking_slots'
          AND  INDEX_NAME   = 'uq_truck_slot'
    ) THEN
        ALTER TABLE booking_slots
            ADD CONSTRAINT uq_truck_slot
                UNIQUE (truck_id, slot_date, time_slot);
    END IF;
END //
DELIMITER ;
CALL _add_uq_truck_slot();
DROP PROCEDURE IF EXISTS _add_uq_truck_slot;

-- ── 2. uq_driver_slot : (driver_id, slot_date, time_slot) ────────────────────

DROP PROCEDURE IF EXISTS _add_uq_driver_slot;
DELIMITER //
CREATE PROCEDURE _add_uq_driver_slot()
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM   INFORMATION_SCHEMA.STATISTICS
        WHERE  TABLE_SCHEMA = DATABASE()
          AND  TABLE_NAME   = 'booking_slots'
          AND  INDEX_NAME   = 'uq_driver_slot'
    ) THEN
        ALTER TABLE booking_slots
            ADD CONSTRAINT uq_driver_slot
                UNIQUE (driver_id, slot_date, time_slot);
    END IF;
END //
DELIMITER ;
CALL _add_uq_driver_slot();
DROP PROCEDURE IF EXISTS _add_uq_driver_slot;

-- ── 3. Verify (informational — returns 2 rows when both constraints exist) ────
SELECT INDEX_NAME, INDEX_TYPE, NON_UNIQUE
FROM   INFORMATION_SCHEMA.STATISTICS
WHERE  TABLE_SCHEMA = DATABASE()
  AND  TABLE_NAME   = 'booking_slots'
  AND  INDEX_NAME   IN ('uq_truck_slot', 'uq_driver_slot')
GROUP  BY INDEX_NAME, INDEX_TYPE, NON_UNIQUE;
