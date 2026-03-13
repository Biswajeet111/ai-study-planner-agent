from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from src.database.mongodb import schedules_collection

from src.services.study_planner_agent import StudyPlannerAgent


app = FastAPI(title="AI Study Planner API")


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


@app.get("/")
def home():
    return {"message": "AI Study Planner API Running"}

@app.get("/schedules")
def get_schedules():

    data = list(schedules_collection.find())

    for d in data:
        d["_id"] = str(d["_id"])

    return data


@app.post("/generate_schedule")
def generate_schedule(request: PlannerRequest):

    subjects = [s.dict() for s in request.subjects]

    agent = StudyPlannerAgent(
        subjects=subjects,
        daily_hours=request.daily_hours
    )

    priority = agent.calculate_priority()
    daily_plan = agent.generate_daily_plan()
    weekly_schedule = agent.generate_weekly_schedule()

    # Data to save in MongoDB
    schedule_data = {
        "subjects": subjects,
        "daily_hours": request.daily_hours,
        "priority_analysis": priority,
        "daily_plan": daily_plan,
        "weekly_schedule": weekly_schedule
    }

    result = schedules_collection.insert_one(schedule_data)

    schedule_data["_id"] = str(result.inserted_id)

    return schedule_data