# Bildungsatlas Flensburg

[![Lint css files](https://github.com/oklabflensburg/open-school-map/actions/workflows/lint-css.yml/badge.svg)](https://github.com/oklabflensburg/open-school-map/actions/workflows/lint-css.yml)
[![Lint js files](https://github.com/oklabflensburg/open-school-map/actions/workflows/lint-js.yml/badge.svg)](https://github.com/oklabflensburg/open-school-map/actions/workflows/lint-js.yml)
[![Lighthouse CI](https://github.com/oklabflensburg/open-school-map/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/oklabflensburg/open-school-map/actions/workflows/lighthouse.yml)

![Bildungsatlas Flensburg](https://raw.githubusercontent.com/oklabflensburg/open-school-map/main/screenshot_bildungsatlas.jpg)

Die Bildungsatlas-Anwendung zeigt alle Schulen Schleswig-Holsteins auf einer interaktiven Leaflet-Karte. Eltern, Interessierte und Kommunen erhalten eine einfache Übersicht zu Standorten, Kontaktdaten und weiterführenden Informationen.

---

## Architektur & Technik

- **Nuxt 3** als Fullstack-Framework (SSR/SPA Hybrid)
- **Leaflet + MarkerCluster** für die Kartenansicht
- **Tailwind CSS** für das responsive Layout
- **Runtime Config** (`nuxt.config.ts`) zum Einspeisen öffentlicher Metadaten (Kontakt, Adresse, API-Endpunkte)
- **Client Rendering**: Map-Interaktion und Routensteuerung werden im Client gehalten, um den aktuellen Kartenausschnitt beizubehalten

---

## Features

- Interaktive Karte mit Clustering, Tooltips und Detailansicht
- URL-Synchronisation über Slugs (`/schule-x`) – Direktlinks öffnen den passenden Datensatz
- Mobile Bottom-Sheet für die Detailansicht; Karte bleibt beim Öffnen fixiert
- Filter nach Schulart (persistiert per Cookie)
- Geolocation-Modus zum Anzeigen nahegelegener Schulen
- Hamburger-Menü in der mobilen Ansicht mit Schnellzugriff auf Home & About

---

## Schnellstart

### Voraussetzungen

- Node.js ≥ 20
- pnpm ≥ 8 (`npm install -g pnpm`)

### Installation & Entwicklung

```bash
pnpm install
pnpm dev
```

Die App läuft dann unter `http://localhost:3000`.

### Build & Preview

```bash
pnpm build
pnpm preview
```

### Linting

```bash
pnpm run lint:js
pnpm run lint:css
pnpm run lint
```

---

## Konfiguration

Der Nuxt-Quellcode liegt im Ordner `app/`. Legt eure Umgebungsvariablen in `app/.env` ab (optional zusätzlich im Projektroot für die Python-Tools):

```bash
NUXT_PUBLIC_BASE_API_URL=https://api.oklabflensburg.de
NUXT_PUBLIC_WEBSITE_ORIGIN=http://localhost:3000

NUXT_PUBLIC_CONTACT_MAIL=mail@example.com
NUXT_PUBLIC_CONTACT_PHONE="+49xx"
NUXT_PUBLIC_PRIVACY_CONTACT_PERSON="Firstname Lastname"

NUXT_PUBLIC_ADDRESS_NAME="Address Name"
NUXT_PUBLIC_ADDRESS_STREET="Address Street"
NUXT_PUBLIC_ADDRESS_HOUSE_NUMBER="House Number"
NUXT_PUBLIC_ADDRESS_POSTAL_CODE="Postal Code"
NUXT_PUBLIC_ADDRESS_CITY="City"
```

Diese Variablen werden im Client genutzt (Kontaktangaben, Impressum usw.) und _müssen_ gesetzt sein.

---

## Daten & Backend

Die Anwendung konsumiert das Schul-API des OK Lab Flensburg (`/school/v1/...`). Für eigene Deployments stehen Skripte im `tools/`-Ordner bereit:

1. **PostgreSQL/PostGIS** vorbereiten (siehe `data/schulatlas_schema.sql`)
2. **Daten importieren**:
   ```bash
   cd tools
   python3 insert_school_csv.py --env ../app/.env --src ../data/schulen_schleswig_holstein.csv --verbose
   python convert_dataset.py ../data/schulen_flensburg.csv
   python insert_facility.py ../data/schulen_flensburg.geojson
   python update_districts.py
   python merge_districts.py ../data/schulen_flensburg.geojson
   python generate_sitemap.py ../data/schulen_flensburg.geojson ../app/public/sitemap.xml https://schulen-in-flensburg.de/
   ```

Das TSV `schulen_schleswig_holstein.csv` unterstützt die Spalte `wikidata_p13491` (7-stellige Schulnummer). Beim Import wird daraus automatisch die `wikidata_id` (Q-ID) über Wikidata-Property [P13491](https://www.wikidata.org/wiki/Property:P13491) aufgelöst und in der Datenbank gespeichert.

Die Skripte setzen ein konfiguriertes Python-Environment voraus (`virtualenv`, `requirements.txt` im gleichen Ordner).

---

## Mitarbeit & Kontakt

- Feedback & Issues: gerne über das GitHub Repository
- Mail: `oklabflensburg@grain.one`
- Pull Requests willkommen – siehe [CONTRIBUTING.md](CONTRIBUTING.md)

---

## Lizenz

Die Anwendung steht unter [CC0-1.0](LICENSE) – freie Nutzung und Adaption ausdrücklich erlaubt.
