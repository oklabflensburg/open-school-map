-- TABELLE SCHULEN SCHLESWIG-HOLSTEIN
DROP TABLE IF EXISTS sh_school CASCADE;

CREATE TABLE IF NOT EXISTS sh_school (
  id SERIAL PRIMARY KEY,
  name VARCHAR,
  city VARCHAR,
  zipcode VARCHAR,
  street VARCHAR,
  house_number VARCHAR,
  telephone VARCHAR,
  fax VARCHAR,
  email VARCHAR,
  website VARCHAR,
  longitude NUMERIC,
  latitude NUMERIC,
  agency_number VARCHAR,
  main_school_type INTEGER CHECK (main_school_type IN (
      1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192
  )),
  school_type INTEGER CHECK (school_type >= 0),
  slug VARCHAR,
  wkb_geometry GEOMETRY(Point, 4326)
);


-- TABELLE SCHULTYPEN SCHLESWIG-HOLSTEIN
DROP TABLE IF EXISTS sh_school_type CASCADE;

CREATE TABLE IF NOT EXISTS sh_school_type (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    code INTEGER NOT NULL UNIQUE CHECK (
        code IN (1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192)
    )
);

INSERT INTO sh_school_type (name, code) VALUES
  ('Grundschule (GS)', 1),
  ('Hauptschule (HS)', 2),
  ('Grund- und Hauptschule (GHS)', 4),
  ('Förderzentrum (FöZ)', 8),
  ('Realschule (RS)', 16),
  ('Gymnasium (Gym)', 32),
  ('Gesamtschule (GesS)', 64),
  ('Berufsbildende Schule (BBS)', 128),
  ('Schulen in freier Trägerschaft', 256),
  ('Regionalschule (RegS)', 512),
  ('Gemeinschaftsschule (GemS)', 1024),
  ('Gemeinschaftsschule mit Oberstufe', 2048),
  ('Ganztagsschule - offen', 4096),
  ('Ganztagsschule - gebunden', 8192);


-- INDEX
CREATE INDEX IF NOT EXISTS idx_sh_school_type_code ON sh_school_type (code);


-- UNIQUE INDEX
CREATE UNIQUE INDEX IF NOT EXISTS idx_sh_school_agency_number ON sh_school (agency_number);

-- GEOMETRY INDEX
CREATE INDEX IF NOT EXISTS idx_sh_school_geometry ON sh_school USING GIST (wkb_geometry);