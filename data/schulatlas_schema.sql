-- POSTGIS ERWEITERUNG LADEN
CREATE EXTENSION IF NOT EXISTS postgis;


-- TABELLE SCHULEN
DROP TABLE IF EXISTS school_facility CASCADE;

CREATE TABLE IF NOT EXISTS school_facility (
  id INT NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  district_id INT REFERENCES districts (id),
  city VARCHAR,
  street_name VARCHAR,
  house_number VARCHAR,
  postal_code VARCHAR,
  phone_number VARCHAR,
  website VARCHAR,
  facility VARCHAR,
  director VARCHAR,
  institution VARCHAR,
  prerequisite VARCHAR,
  employees INT,
  teachers INT,
  students INT,
  grades VARCHAR,
  open_all_day BOOLEAN,
  compulsory_all_day BOOLEAN,
  graduation_esa BOOLEAN,
  graduation_msa BOOLEAN,
  graduation_abi BOOLEAN,
  private_school BOOLEAN,
  special_needs_school BOOLEAN,
  elementary_school BOOLEAN,
  secondary_school BOOLEAN,
  high_school BOOLEAN,
  wkb_geometry GEOMETRY(GEOMETRY, 4326)
);

CREATE INDEX IF NOT EXISTS school_facility_wkb_geometry_idx ON school_facility USING GIST (wkb_geometry);
