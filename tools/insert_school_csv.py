import os
import re
import sys
import traceback
import logging as log
import csv
import json
import urllib.parse
import urllib.request

from datetime import datetime
from pathlib import Path

import click
import psycopg2

from shapely.geometry import Point
from dotenv import load_dotenv


# ISO 8601 date format
DATE_FORMAT = '%Y-%m-%dT%H:%M:%SZ'
WIKIDATA_SPARQL_URL = 'https://query.wikidata.org/sparql'


def log_exceptions(type, value, tb):
    exception = traceback.TracebackException(type, value, tb)

    for line in exception.format(chain=True):
        log.exception(line)

    log.exception(value)

    sys.__excepthook__(type, value, tb)


def connect_database(env_path: str) -> psycopg2.extensions.connection:
    try:
        load_dotenv(dotenv_path=Path(env_path))
        conn = psycopg2.connect(
            database=os.getenv('DB_NAME'),
            password=os.getenv('DB_PASS'),
            user=os.getenv('DB_USER'),
            host=os.getenv('DB_HOST'),
            port=os.getenv('DB_PORT')
        )

        conn.autocommit = True

        log.info('Connection to database established.')

        return conn
    except Exception as e:
        log.error(f"Failed to connect to the database: {e}")
        sys.exit(1)


def str_to_bool(v: str) -> bool:
    return v.lower() in ('yes', 'true', 't', '1')


def parse_datetime(s: str) -> datetime:
    try:
        return datetime.strptime(s, DATE_FORMAT)
    except ValueError as e:
        log.error(f"Failed to parse date '{s}': {e}")

        return None


def parse_value(value: str, conversion_func=None):
    if value is None or value == '':
        return None

    return conversion_func(value) if conversion_func else value


def parse_geometry(lat: float, lon: float) -> bytes:
    if lat is None or lon is None:
        log.warning('Latitude and longitude must not be empty.')

        return None

    return Point(lon, lat).wkb


def normalize_wikidata_id(value: str):
    wikidata_id = parse_value(value)
    if wikidata_id is None:
        return None

    wikidata_id = wikidata_id.strip()
    if re.fullmatch(r'Q[1-9]\d*', wikidata_id, flags=re.IGNORECASE):
        return wikidata_id.upper()

    match = re.search(r'/(?:wiki|entity)/(Q[1-9]\d*)\b', wikidata_id, flags=re.IGNORECASE)
    if match:
        return match.group(1).upper()

    log.warning(f"Invalid Wikidata ID '{value}' - expected 'Q12345' or Wikidata URL.")
    return None


def normalize_wikidata_p13491(value: str):
    p13491 = parse_value(value)
    if p13491 is None:
        return None

    p13491 = p13491.strip()
    if re.fullmatch(r'\d{7}', p13491):
        return p13491

    match = re.search(r'(?<!\d)(\d{7})(?!\d)', p13491)
    if match:
        return match.group(1)

    return None


def chunked(values: list, size: int):
    for i in range(0, len(values), size):
        yield values[i:i + size]


def fetch_wikidata_qids_by_p13491(values: set[str]) -> dict[str, str]:
    if not values:
        return {}

    result = {}
    values_sorted = sorted(values)

    for chunk in chunked(values_sorted, 250):
        values_sparql = ' '.join(f'"{value}"' for value in chunk)
        query = f'''
            SELECT ?p13491 ?item WHERE {{
              VALUES ?p13491 {{ {values_sparql} }}
              ?item wdt:P13491 ?p13491 .
            }}
        '''
        params = urllib.parse.urlencode({
            'query': query,
            'format': 'json'
        })
        url = f'{WIKIDATA_SPARQL_URL}?{params}'
        request = urllib.request.Request(url, headers={
            'Accept': 'application/sparql-results+json',
            'User-Agent': 'open-school-map/1.0 (https://github.com/oklabflensburg/open-school-map)'
        })

        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                payload = json.loads(response.read().decode('utf-8'))
        except Exception as e:
            log.warning(f'Failed to fetch Wikidata IDs for a chunk: {e}')
            continue

        for binding in payload.get('results', {}).get('bindings', []):
            property_value = binding.get('p13491', {}).get('value')
            item_url = binding.get('item', {}).get('value')
            qid = normalize_wikidata_id(item_url)
            p13491 = normalize_wikidata_p13491(property_value)
            if p13491 and qid:
                result[p13491] = qid

    return result


def replace_umlauts(string):
    slug = string

    tpl = (('ü', 'ue'), ('Ü', 'Ue'), ('ä', 'ae'), ('Ä', 'Ae'),
           ('ö', 'oe'), ('Ö', 'Oe'), ('ß', 'ss'), ('ø', 'oe'))

    for item1, item2 in tpl:
        slug = slug.replace(item1, item2)

    return slug


def get_slug(values):
    parts = []

    for value in values:
        parts.append(
            re.sub(r'[\d\s!@#\$%\^&\*\(\)\[\]{};:,\./<>\?\|`~\-=_\+]', ' ', value))

    slug = ' '.join(list(dict.fromkeys(parts))).lower()
    slug = re.sub(r'\s+', ' ', replace_umlauts(slug)).replace(' ', '-')

    return slug


def insert_row(cur, row: dict, wikidata_by_p13491: dict[str, str]):
    values = []

    source_id = parse_value(row.get('id'), int)
    name = parse_value(row.get('name'))
    city = parse_value(row.get('city'))
    zipcode = parse_value(row.get('zipcode'))
    street = parse_value(row.get('street'))
    house_number = parse_value(row.get('house_number'))
    telephone = parse_value(row.get('telephone'))
    fax = parse_value(row.get('fax'))
    email = parse_value(row.get('email'))
    website = parse_value(row.get('website'))
    longitude = parse_value(row.get('longitude'), float)
    latitude = parse_value(row.get('latitude'), float)
    agency_number = parse_value(row.get('agency_number'))
    main_school_type = parse_value(row.get('main_school_type'), int)
    school_type = parse_value(row.get('school_type'), int)
    wikidata_p13491 = normalize_wikidata_p13491(
        row.get('wikidata_p13491') or row.get('agency_number'))
    wikidata_id = normalize_wikidata_id(row.get('wikidata_id') or row.get('wikidata'))
    if wikidata_id is None and wikidata_p13491:
        wikidata_id = wikidata_by_p13491.get(wikidata_p13491)
    wkb_geometry = parse_geometry(latitude, longitude)

    values.append(name)
    values.append(city)

    slug = get_slug(values)

    sql = '''
        INSERT INTO sh_school (source_id, name, city, zipcode, street, house_number,
            telephone, fax, email, website, agency_number,
            main_school_type, school_type, wikidata_p13491, wikidata_id, slug, wkb_geometry)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s)
        ON CONFLICT (agency_number) DO UPDATE
            SET source_id = COALESCE(EXCLUDED.source_id, sh_school.source_id),
                name = EXCLUDED.name,
                city = EXCLUDED.city,
                zipcode = EXCLUDED.zipcode,
                street = EXCLUDED.street,
                house_number = EXCLUDED.house_number,
                telephone = EXCLUDED.telephone,
                fax = EXCLUDED.fax,
                email = EXCLUDED.email,
                website = EXCLUDED.website,
                main_school_type = EXCLUDED.main_school_type,
                school_type = EXCLUDED.school_type,
                wikidata_p13491 = COALESCE(EXCLUDED.wikidata_p13491, sh_school.wikidata_p13491),
                wikidata_id = COALESCE(EXCLUDED.wikidata_id, sh_school.wikidata_id),
                slug = EXCLUDED.slug,
                wkb_geometry = EXCLUDED.wkb_geometry
        RETURNING id
    '''
    try:
        cur.execute(sql, (source_id, name, city, zipcode, street, house_number,
                          telephone, fax, email, website, agency_number,
                          main_school_type, school_type, wikidata_p13491, wikidata_id, slug, wkb_geometry))
        last_inserted_id = cur.fetchone()[0]
        status = cur.statusmessage
        if status and status.startswith('INSERT'):
            log.info(f"Inserted school '{name}' with ID {last_inserted_id}.")
        else:
            log.info(f"Updated school '{name}' (ID {last_inserted_id}).")
    except Exception as e:
        log.error(f"Failed to insert row: {e}")


def read_csv(conn, src: Path):
    cur = conn.cursor()

    with open(src, newline='') as csvfile:
        rows = list(csv.DictReader(csvfile, delimiter='\t'))

    p13491_values = set()
    for row in rows:
        p13491 = normalize_wikidata_p13491(row.get('wikidata_p13491') or row.get('agency_number'))
        if p13491:
            p13491_values.add(p13491)

    log.info(f"Resolving Wikidata QIDs via P13491 for {len(p13491_values)} schools.")
    wikidata_by_p13491 = fetch_wikidata_qids_by_p13491(p13491_values)
    log.info(f"Resolved {len(wikidata_by_p13491)} Wikidata QIDs via P13491.")

    for row in rows:
        insert_row(cur, row, wikidata_by_p13491)


@click.command()
@click.option('--env', '-e', type=str, required=True, help='Path to the .env file.')
@click.option('--src', '-s', type=click.Path(exists=True), required=True, help='Path to the CSV file.')
@click.option('--verbose', '-v', is_flag=True, help='Enable verbose logging.')
@click.option('--debug', '-d', is_flag=True, help='Enable debug logging.')
def main(env: str, src: str, verbose: bool, debug: bool):
    if debug:
        log.basicConfig(format='%(levelname)s: %(message)s', level=log.DEBUG)
    elif verbose:
        log.basicConfig(format='%(levelname)s: %(message)s', level=log.INFO)
        log.info('Set logging level to verbose.')
    else:
        log.basicConfig(format='%(levelname)s: %(message)s')

    log.info(f"System recursion limit: {sys.getrecursionlimit()}")
    conn = connect_database(env)
    read_csv(conn, Path(src))


if __name__ == '__main__':
    sys.excepthook = log_exceptions
    main()
