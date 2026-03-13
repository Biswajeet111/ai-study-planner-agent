from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from src.database.mongodb import schedules_collection

from src.services.study_planner_agent import StudyPlannerAgent
from src.services.llm_insights import generate_insights
from src.services.llm_insights import explain_plan
from src.services.study_chatbot import study_chat
from src.services.llm_insights import motivation_message


app = FastAPI(title="AI Study Planner API")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "https://studyai-eight-delta.vercel.app",
    "https://*.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex="https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Subject(BaseModel):
    name: str
    difficulty: int
    previous_score: float
    study_hours: float
    sleep_hours: float
    practice_papers: int


class PlannerRequest(BaseModel):
    subjects: List[Subject]
    daily_hours: float

class ProgressUpdate(BaseModel):
    subject: str
    hours_completed: float
    test_score: float

class ChatRequest(BaseModel):
    question: str

@app.get("/")
def home():
    return {"message": "AI Study Planner API Running"}

@app.get("/schedules")
def get_schedules():

    data = list(
    schedules_collection.find(
        {"subjects": {"$exists": True}}
    ).sort("_id", -1).limit(20)
)

    for d in data:
        d["_id"] = str(d["_id"])

    return data

@app.get("/motivation")
def get_motivation(progress_score: float):
    message = motivation_message(progress_score)
    return {"motivation": message}

@app.get("/db_test")
def db_test():
    schedules_collection.insert_one({"test": "working"})
    return {"message": "MongoDB connected successfully"}

@app.post("/generate_schedule")
def generate_schedule(request: PlannerRequest):

    subjects = [s.model_dump() for s in request.subjects]

    agent = StudyPlannerAgent(
        subjects=subjects,
        daily_hours=request.daily_hours
    )

    priority = agent.calculate_priority()
    daily_plan = agent.generate_daily_plan()
    weekly_schedule = agent.generate_weekly_schedule()

    insights = generate_insights(subjects, priority, daily_plan)

    schedule_data = {
        "subjects": subjects,
        "daily_hours": request.daily_hours,
        "priority_analysis": priority,
        "daily_plan": daily_plan,
        "weekly_schedule": weekly_schedule,
        "ai_insights": insights
    }

    result = schedules_collection.insert_one(schedule_data)

    schedule_data["_id"] = str(result.inserted_id)

    return schedule_data

@app.post("/explain_plan")
def explain_study_plan(request: PlannerRequest):

    subjects = [s.model_dump() for s in request.subjects]

    agent = StudyPlannerAgent(
        subjects=subjects,
        daily_hours=request.daily_hours
    )

    priority = agent.calculate_priority()
    daily_plan = agent.generate_daily_plan()
    weekly_schedule = agent.generate_weekly_schedule()

    explanation = explain_plan(priority, daily_plan, weekly_schedule)

    return {
        "explanation": explanation
    }

@app.post("/update_progress")
def update_progress(progress: ProgressUpdate):

    planned_hours = 4

    progress_score = (progress.hours_completed / planned_hours) * 100 if planned_hours > 0 else 0

    # XP calculation
    xp = int(progress.hours_completed * 10)

    data = {
        "subject": progress.subject,
        "hours_completed": progress.hours_completed,
        "test_score": progress.test_score,
        "progress_score": progress_score,
        "xp": xp
    }

    schedules_collection.insert_one({
        "type": "progress_update",
        "data": data
    })

    return {
        "message": "Progress updated successfully",
        "progress_score": progress_score,
        "xp_earned": xp
    }


@app.get("/progress_updates")
def get_progress_updates(limit: int = 50):

    safe_limit = max(1, min(limit, 200))
    cursor = schedules_collection.find(
        {"type": "progress_update"}
    ).sort("_id", -1).limit(safe_limit)

    updates = []
    for row in cursor:
        updates.append(
            {
                "_id": str(row.get("_id")),
                "type": row.get("type"),
                "data": row.get("data", {}),
            }
        )

    return updates

    
@app.post("/study_chat")
def study_chatbot(chat: ChatRequest):

    schedule = schedules_collection.find_one(
    {"subjects": {"$exists": True}},
    sort=[("_id", -1)]
)

    if not schedule:
        return {"message": "No schedule found"}

    schedule["_id"] = str(schedule["_id"])

    answer = study_chat(chat.question, schedule)

    return {
        "question": chat.question,
        "answer": answer
    }