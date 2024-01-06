#!./venv/bin/python

import os
import csv
import click
import json

from dotenv import load_dotenv
from geojson import FeatureCollection, Feature, Point
from pathlib import Path


env_path = Path('../.env')
load_dotenv(dotenv_path=env_path)


try:
    api_key = os.getenv('API_KEY')
except Exception as e:
    raise(e)


def generate_geojson(features):
    fc = []

    crs = {
        'type': 'name',
        'properties': {
            'name': 'urn:ogc:def:crs:OGC:1.3:CRS84'
        }
    }

    for feature in features:
        coordinates = feature['geometry']['coordinates']

        geometry = Point((float(coordinates[1]), float(coordinates[0])))
        properties = feature['properties']

        fc.append(Feature(geometry=geometry, properties=properties))

    c = FeatureCollection(fc, crs=crs)

    return c


def read_input(src):
    features = []

    with open(src, 'r') as f:
        reader = csv.DictReader(f)

        for i in reader:
            properties = {}
            geometries = {}

            properties['street_name'] = i['Straße'].strip()
            properties['house_number'] = i['Hausnummer'].strip()
            properties['postal_code'] = i['PLZ'].strip()
            properties['city'] = i['City'].strip()
            properties['phone_number'] = i['Tel'].strip()
            properties['website'] = i['Web'].strip()
            properties['facility'] = i['Schulname'].strip()
            properties['director'] = i['Schulleiter'].strip()
            properties['institution'] = i['Schulträger'].strip()
            properties['prerequisite'] = i['Vorraussetzung'].strip()
            properties['employees'] = i['Angestellte'].strip()
            properties['teachers'] = i['Lehrkräfte'].strip()
            properties['students'] = i['Schüler'].strip()
            properties['grades'] = i['Jahrgänge'].strip()
            properties['open_all_day'] = i['Offene Ganztagsschule'].strip()
            properties['compulsory_all_day'] = i['Gebundene Ganztagsschule'].strip()
            properties['graduation_esa'] = i['ESA'].strip()
            properties['graduation_msa'] = i['MSA'].strip()
            properties['graduation_abi'] = i['Abitur'].strip()
            properties['special_needs_school'] = i['Förderschule'].strip()
            properties['elementary_school'] = i['Grundschule'].strip()
            properties['secondary_school'] = i['Gemeinschaftsschule'].strip()
            properties['high_school'] = i['Gymnasium'].strip()


            geometries['coordinates'] = [i['Lat'], i['Lon']]

            f = {
                'geometry': geometries,
                'properties': properties
            }

            features.append(f)

    return features


@click.command()
@click.argument('src')
def main(src):
    filename = Path(src).stem
    parent = str(Path(src).parent)
    dest = Path(f'{parent}/{filename}.geojson')

    features = read_input(src)
    collection = generate_geojson(features)

    with open(dest, 'w', encoding='utf8') as f:
        json.dump(collection, f, ensure_ascii=False)


if __name__ == '__main__':
    main()
