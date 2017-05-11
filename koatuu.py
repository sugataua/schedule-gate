import csv
import re
from schedule.model import Settlement
from schedule import db

fin = open('KOATUU_14022017_filtered.csv')

fout = open('errors.txt', 'w')

LIMIT = 100
error_count = 0

DISTRICT_CODE_PATTERN = re.compile(r"^(\d){2}2(\d){1,2}0{5}$")

carpathian_regions = {'73':'Чернівецька', '46':'Львівська', '26':'Івано-Франківська', '21':'Закарпатська'}
district_name = ""

with open('koatuu_codes.csv', encoding='utf-8') as kfile:
    spamreader = csv.reader(kfile, delimiter=';')  
     
    for row in spamreader:

        if len(row[0]) < 10:
            row[0] = '0' + row[0]

        region_code = row[0][:2]                
            
        
        if region_code in carpathian_regions:
            if re.match(DISTRICT_CODE_PATTERN, row[0]):
                if '/' in row[2]:
                    end_index = row[2].find(' РАЙОН/')
                    
                    district_name = row[2][0:end_index] 
                    print(district_name)
            
            settls = Settlement.query.filter_by(name=row[2], region=carpathian_regions[region_code]).all()
            
            if len(settls) > 1:
                print("Multiple settlements in region :(", row[0])
                print(row[2])
                print(settls)
                print(district_name.title())
                settls_strict = Settlement.query.filter_by(name=row[2], \
                                region=carpathian_regions[region_code], district=district_name.title()).all()
                if len(settls_strict) > 1 or len(settls_strict) == 0:
                    print("Nevermore Eroror!")
                    error_count += 1
                    fout.write(str(row) + " | " + str(settls_strict) + "\n")                    
                    #break
                if len(settls) == 1: 
                    settls = settls_strict
                    print("Fixed :)")
                
            if len(settls) != 0: 
                #print(settls)
                settls[0].koatuu = row[0]
                db.session.add(settls[0])
        

    
    db.session.commit()
    print("Erors:", error_count)
    fout.close()



