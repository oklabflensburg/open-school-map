#!./venv/bin/python

import os
import psycopg2

from pathlib import Path
from dotenv import load_dotenv


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


def update_facility(cur, facility_id, district_id):
    sql = 'UPDATE school_facility SET district_id = %s WHERE id = %s'
    
    try:
        cur.execute(sql, (district_id, facility_id))
    except (Exception, psycopg2.DatabaseError) as e:
        print(e)


def main():
    cur = conn.cursor()

    cur.execute('''
        SELECT sf.id, d.id
        FROM school_facility AS sf
        JOIN districts AS d
        ON ST_Contains(d.wkb_geometry, sf.wkb_geometry)
    ''')

    rows = cur.fetchall()

    for row in rows:
        update_facility(cur, row[0], row[1])
        print(row)


if __name__ == '__main__':
    main()
