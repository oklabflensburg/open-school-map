# Bildungsatlas Flensburg

[![Lint css files](https://github.com/oklabflensburg/open-school-map/actions/workflows/lint-css.yml/badge.svg)](https://github.com/oklabflensburg/open-school-map/actions/workflows/lint-css.yml)
[![Lint html files](https://github.com/oklabflensburg/open-school-map/actions/workflows/lint-html.yml/badge.svg)](https://github.com/oklabflensburg/open-school-map/actions/workflows/lint-html.yml)
[![Lint js files](https://github.com/oklabflensburg/open-school-map/actions/workflows/lint-js.yml/badge.svg)](https://github.com/oklabflensburg/open-school-map/actions/workflows/lint-js.yml)
[![Lighthouse CI](https://github.com/oklabflensburg/open-school-map/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/oklabflensburg/open-school-map/actions/workflows/lighthouse.yml)


![Bildungsatlas Flensburg](https://raw.githubusercontent.com/oklabflensburg/open-school-map/main/screenshot_bildungsatlas.jpg)

Der offene Bildungsatlas für Flensburg zeigt auf einer interaktiven Karte regionale Bildungseinrichtungen und eine Vielzahl an Daten an. Die Seite soll Eltern und Institutionen eine einfache und übersichtliche Informationsquelle anbieten.



## Hintergrund

Die Idee, einen offenen Bildungsatlas für Flensburg zu entwickeln, ist aus der eigenen Suche nach einer Grundschule für den Lütten entstanden. Auf der [städtischen Website](https://www.flensburg.de/Leben-Soziales/Kinderbetreuung-Schulen/Grundschulen) finden sich zwar Kontaktdetails zu Schulen, jedoch weder eine übersichtliche, vergleichbare Information zu den einzelnen Schulen noch eine Karte, um den möglichen Schulweg zum Wohnort einzuschätzen. Mit dieser Webseite zeigen wir die Umsetzbarkeit eines solchen Systems.


## Datenquelle

Ein wesentlicher Teil der Informationen stammt von den verlinkten Seiten, wie beispielsweise zur Schulform, dem Schulleiter, dem Träger und der Anschrift. Zusätzlich haben wir Daten aus dem [Verzeichnis der allgemeinbildenden Schulen in Schleswig-Holstein](https://www.statistik-nord.de/fileadmin/Dokumente/Verzeichnisse/Schulverzeichnis_A_22-23.pdf) genutzt und in bestimmten Fällen auf Informationen aus dem [Verzeichnis der berufsbildenden Schulen in Schleswig-Holstein](https://www.statistik-nord.de/fileadmin/Dokumente/Verzeichnisse/Schulverzeichnis_B_22-23.pdf) zurückgegriffen. Die Kartendarstellung wurde von engagierten Eltern und ehrenamtlichen Mitgliedern des [OK Lab Flensburgs](https://oklabflensburg.de) entwickelt.


## Mitmachen

Du kannst jederzeit ein Issue auf GitHub öffnen oder uns über oklabflensburg@grain.one schreiben



## How to Build

You must execute this commands in the root directory. Make sure you have node installed on your machine, then install dependencies. 

```
pnpm install
```


When you want to build the project run the following command

```
pnpm build
```


When you are developing on your local machine run this command

```
pnpm start
```



## Prerequisite

Install system dependencies and clone repository

```
sudo apt install git git-lfs virtualenv python3 python3-pip postgresql-16 postgresql-16-postgis-3 postgis
git clone https://github.com/oklabflensburg/open-school-map.git
```

Create a dot `.env` file inside root directory. Make sure to add the following content repaced by your own values

```
DB_PASS=postgres
DB_HOST=localhost
DB_USER=postgres
DB_NAME=postgres
DB_PORT=5432
```


## Update repository

```
git pull
git lfs pull
```


## Create SQL schema

Run sql statements inside `open-school-map` root directory to create schema.

```
sudo -i -Hu postgres psql -U postgres -h localhost -d postgres -p 5432 < data/schulatlas_schema.sql
```


## Import inventory

Required when you want to fetch data via API or want to update dataset. When running the python scripts. Make sure you replace the arguments with your arguments.

```
cd tools
virtualenv venv
source venv/bin/activate
pip install -r requirements.txt
python convert_dataset.py ../data/schulen_flensburg.csv
python insert_facility.py ../data/schulen_flensburg.geojson
python update_districts.py
python merge_districts.py ../data/schulen_flensburg.geojson
python generate_sitemap.py ../data/schulen_flensburg.geojson ../static/sitemap.xml https://schulen-in-flensburg.de/
deactivate
```


## Todos

- Geometrien der Spiel- und Pausenflächen von OpenStreetMap extrahieren
- Anzahl der ausgefallenen Schulstunden pro Schuljahr und Jahrgang anfragen
- Anzahl der Lehrkräfte und Angestellten pro Schule und Schuljahr anfragen