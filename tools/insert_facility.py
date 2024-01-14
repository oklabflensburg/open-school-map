#!./venv/bin/python

import os
import click
import psycopg2
import json

from shapely import wkb
from psycopg2 import ProgrammingError
from psycopg2.errors import UniqueViolation, NotNullViolation
from shapely.geometry import shape, Point
from dotenv import load_dotenv
from pathlib import Path


env_path = Path('../.env')
load_dotenv(dotenv_path=env_path)


try:
    conn = psycopg2.connect(
        database = os.getenv('DB_NAME'),
        password = os.getenv('DB_PASS'),
        user = os.getenv('DB_USER'),
        host = os.getenv('DB_HOST'),
        port = os.getenv('DB_PORT')
    )
    conn.autocommit = True
except Exception as e:
    raise


def retrieve_features(cur, features):
    for feature in features:
        properties = feature['properties']

        insert_object(cur, properties, feature['geometry'])


def insert_object(cur, properties, geometry):
    city = properties['city'] if properties['city'] else None
    street_name = properties['street_name'] if properties['street_name'] else None
    house_number = properties['house_number'] if properties['house_number'] else None
    postal_code = properties['postal_code'] if properties['postal_code'] else None
    phone_number = properties['phone_number'] if properties['phone_number'] else None
    website = properties['website'] if properties['website'] else None
    facility = properties['facility'] if properties['facility'] else None
    director = properties['director'] if properties['director'] else None
    institution = properties['institution'] if properties['institution'] else None
    prerequisite = properties['prerequisite'] if properties['prerequisite'] else None
    employees = properties['employees'] if properties['employees'] else None
    teachers = properties['teachers'] if properties['teachers'] else None
    students = properties['students'] if properties['students'] else None
    grades = properties['grades'] if properties['grades'] else None
    open_all_day = properties['open_all_day'] if properties['open_all_day'] else None
    compulsory_all_day = properties['compulsory_all_day'] if properties['compulsory_all_day'] else None
    graduation_esa = properties['graduation_esa'] if properties['graduation_esa'] else None
    graduation_msa = properties['graduation_msa'] if properties['graduation_msa'] else None
    graduation_abi = properties['graduation_abi'] if properties['graduation_abi'] else None
    private_school = properties['private_school'] if properties['private_school'] else None
    special_needs_school = properties['special_needs_school'] if properties['special_needs_school'] else None
    elementary_school = properties['elementary_school'] if properties['elementary_school'] else None
    secondary_school = properties['secondary_school'] if properties['secondary_school'] else None
    high_school = properties['high_school'] if properties['high_school'] else None

    g = Point(shape(geometry))
    wkb_geometry = wkb.dumps(g, hex=True, srid=4326)

    sql = '''
        INSERT INTO school_facility (city, street_name, house_number, postal_code,
            phone_number, website, facility, director, institution, prerequisite,
            employees, teachers, students, grades, open_all_day, compulsory_all_day,
            graduation_esa, graduation_msa, graduation_abi, private_school, special_needs_school,
            elementary_school, secondary_school, high_school, wkb_geometry)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    '''

    try:
        cur.execute(sql, (city, street_name, house_number, postal_code, phone_number,
            website, facility, director, institution, prerequisite, employees, teachers,
            students, grades, open_all_day, compulsory_all_day, graduation_esa, graduation_msa,
            graduation_abi, special_needs_school, private_school, elementary_school,
            secondary_school, high_school, wkb_geometry))
    except UniqueViolation as e:
        print(e)
        return


@click.command()
@click.argument('file')
def main(file):
    cur = conn.cursor()

    with open(Path(file), 'r') as f:
        features = json.loads(f.read())['features']

    retrieve_features(cur, features)


if __name__ == '__main__':
    main()
