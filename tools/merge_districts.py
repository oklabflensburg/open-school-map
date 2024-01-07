#!./venv/bin/python

import os
import re
import csv
import psycopg2
import click
import json

from dotenv import load_dotenv
from geojson import FeatureCollection, Feature, Point
from datetime import datetime
from pathlib import Path


dotenv_path = Path('../.env')
load_dotenv(dotenv_path)  

    
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


def read_json(src):
    with open(Path(src), 'r') as f:
        data = json.loads(f.read())

        return data


def write_json(dst, data):
    with open(Path(dst), 'w') as f:
        json.dump(data, f, ensure_ascii=False)


@click.command()
@click.argument('src')
def main(src):
    facilities = read_json(src)

    cur = conn.cursor()
    cur.execute('SELECT id, district_id FROM school_facility')

    rows = cur.fetchall()

    for row in rows:
        if row[1]:
            facilities['features'][row[0] - 1]['properties']['district_id'] = row[1]
            print(row[1])

    write_json(src, facilities)


if __name__ == '__main__':
    main()
