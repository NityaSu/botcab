-- Hibernate maps String → VARCHAR; fares.currency was CHAR(3) from V1.
ALTER TABLE fares
    ALTER COLUMN currency TYPE VARCHAR(3);
