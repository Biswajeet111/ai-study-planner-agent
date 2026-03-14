import os
from pymongo import MongoClient

MONGO_URI = os.getenv("MONGODB_URI")

try:
    client = MongoClient(MONGO_URI)

    db = client["studyforge"]

    schedules_collection = db["schedules"]

    print("MongoDB connected successfully")

except Exception as e:
    print("MongoDB connection failed:", e)

    schedules_collection = None