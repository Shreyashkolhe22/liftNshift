-- =============================================================================
-- V2__seed_trucks_drivers_items.sql
--
-- Reference data carried over from the old MySQL database
-- (docs/db/shift_backup_20260803_170826.sql): trucks, drivers and the
-- predefined item catalogue. IDs are left to the identity column so the
-- sequences stay in sync; ON CONFLICT keeps this safe if rows already exist.
-- =============================================================================

INSERT INTO trucks (reg_number, size, capacity_kg, is_active) VALUES
  ('MH-ADHDH_898364', 'SMALL',  600,  true),
  ('MH-93U894-HERU',  'LARGE',  2000, true),
  ('MH-94975-HFWJ',   'SMALL',  600,  true),
  ('MH-OWEU-UUWE',    'LARGE',  2000, true),
  ('MH762365476',     'MEDIUM', 1200, true)
ON CONFLICT (reg_number) DO NOTHING;

INSERT INTO drivers (name, license_no, phone, is_active) VALUES
  ('papuuu',  '34782535R7',     '9858372347', true),
  ('saluuuu', 'KHD83272438294', '8437934933', true)
ON CONFLICT (phone) DO NOTHING;

INSERT INTO predefined_items (name, price) VALUES
  ('Refrigerator', 1200.00),
  ('Washing Machine', 900.00),
  ('Microwave Oven', 500.00),
  ('Air Conditioner (1 Ton)', 1500.00),
  ('Air Conditioner (1.5 Ton)', 1800.00),
  ('LED TV (32 inch)', 700.00),
  ('LED TV (43 inch)', 900.00),
  ('LED TV (55 inch)', 1200.00),
  ('Ceiling Fan', 250.00),
  ('Water Purifier', 400.00),
  ('Geyser', 500.00),
  ('Mixer Grinder', 200.00),
  ('Induction Cooktop', 250.00),
  ('Gas Stove', 300.00),
  ('Kitchen Chimney', 800.00),
  ('Dishwasher', 1200.00),
  ('Vacuum Cleaner', 350.00),
  ('Air Cooler', 500.00),
  ('Room Heater', 300.00),
  ('Electric Iron', 100.00),
  ('Laptop', 300.00),
  ('Desktop Computer', 500.00),
  ('Printer', 250.00),
  ('WiFi Router', 100.00),
  ('Inverter', 600.00),
  ('Battery', 500.00),
  ('UPS', 250.00),
  ('Water Dispenser', 300.00),
  ('Coffee Machine', 250.00),
  ('Rice Cooker', 200.00)
ON CONFLICT (name) DO NOTHING;
