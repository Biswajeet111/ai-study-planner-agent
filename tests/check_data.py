from src.database.mongodb import schedules_collection

data = list(schedules_collection.find())

for d in data:
    print(d)