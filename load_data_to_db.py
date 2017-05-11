import csv
from schedule_gate.model import Settlement
from schedule_gate import db
with open("localities.csv", encoding='utf-8') as csvfile:
    csv_reader = csv.reader(csvfile, delimiter=";")
    print("Loading is started!")
    for row in csv_reader:
        if row[0] == 'Закарпатська' \
                or row[0] == 'Львівська' \
                or row[0] == 'Івано-Франківська' \
                or row[0] == 'Чернівецька':
            if row[2] != "":
                new_sttl = Settlement()
                new_sttl.name = row[2]
                new_sttl.region = row[0]
                new_sttl.district = row[1]
                new_sttl.coordinate_lon = float(row[3])
                new_sttl.coordinate_lat = float(row[4])
                db.session.add(new_sttl)
            
db.session.commit()
print("All data is loaded to db!")