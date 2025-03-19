import os
import re
import sys
import traceback
import logging as log
import csv

from datetime import datetime
from pathlib import Path

import click
import psycopg2

from shapely.geometry import Point
from dotenv import load_dotenv


# ISO 8601 date format
DATE_FORMAT = '%Y-%m-%dT%H:%M:%SZ'


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


def insert_row(cur, row: dict):
    values = []

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
    wkb_geometry = parse_geometry(latitude, longitude)

    values.append(name)
    values.append(city)

    slug = get_slug(values)

    sql = '''
        INSERT INTO sh_school (name, city, zipcode, street, house_number,
            telephone, fax, email, website, agency_number,
            main_school_type, school_type, slug, wkb_geometry)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s) RETURNING id
    '''
    try:
        cur.execute(sql, (name, city, zipcode, street, house_number,
                          telephone, fax, email, website, agency_number,
                          main_school_type, school_type, slug, wkb_geometry))
        last_inserted_id = cur.fetchone()[0]
        log.info(f"Inserted school '{name}' with ID {last_inserted_id}.")
    except Exception as e:
        log.error(f"Failed to insert row: {e}")


def read_csv(conn, src: Path):
    cur = conn.cursor()

    with open(src, newline='') as csvfile:
        reader = csv.DictReader(csvfile, delimiter='\t')
        for row in reader:
            insert_row(cur, row)


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
