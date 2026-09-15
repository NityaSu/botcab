-- Product locale: Cambodia. ISO currency KHR (Riel). Amounts stay integer (1 unit = 1 riel).
-- Demo phones use country code +855.

ALTER TABLE fares
    ALTER COLUMN currency SET DEFAULT 'KHR';

ALTER TABLE fares
    ALTER COLUMN currency SET DEFAULT 'KHR';

UPDATE fares SET currency = 'KHR' WHERE currency = 'EUR';

UPDATE drivers SET phone = '+855000000011', full_name = 'Demo Driver Sophea' WHERE id = 1;
UPDATE drivers SET phone = '+855000000012', full_name = 'Demo Driver Dara' WHERE id = 2;
UPDATE drivers SET phone = '+855000000013', full_name = 'Demo Driver Vannak' WHERE id = 3;
