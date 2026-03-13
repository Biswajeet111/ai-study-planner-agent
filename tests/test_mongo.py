from src.database.mongodb import db

print("Connected to MongoDB!")

print(db.list_collection_names())   