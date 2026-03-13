from pymongo import MongoClient

MONGO_URI = "mongodb+srv://biswajeetk497_db_user:j0LZPbs2TuGVpZJB@cluster0.jwayjem.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

client = MongoClient(MONGO_URI)

db = client["study_planner"]

students_collection = db["students"]
schedules_collection = db["schedules"]