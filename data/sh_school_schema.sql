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
  main_school_type INT,
  school_type INT,
  slug VARCHAR,
  wkb_geometry GEOMETRY(POINT, 4326)
);

-- GEOMETRY INDEX
CREATE INDEX IF NOT EXISTS idx_sh_school_geometry ON sh_school USING GIST (wkb_geometry);