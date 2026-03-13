from src.services.study_planner_agent import StudyPlannerAgent

subjects = [
    {
        "name": "Math",
        "difficulty": 4,
        "previous_score": 60,
        "study_hours": 5,
        "sleep_hours": 7,
        "practice_papers": 3
    },
    {
        "name": "DSA",
        "difficulty": 5,
        "previous_score": 55,
        "study_hours": 4,
        "sleep_hours": 6,
        "practice_papers": 2
    },
    {
        "name": "AI",
        "difficulty": 3,
        "previous_score": 72,
        "study_hours": 3,
        "sleep_hours": 7,
        "practice_papers": 4
    },
    {
        "name": "DBMS",
        "difficulty": 2,
        "previous_score": 80,
        "study_hours": 2,
        "sleep_hours": 8,
        "practice_papers": 5
    }
]

agent = StudyPlannerAgent(subjects=subjects, daily_hours=6)

print("Priority Analysis:")
for item in agent.calculate_priority():
    print(item)

print("\nDaily Plan:")
print(agent.generate_daily_plan())

print("\nWeekly Schedule:")
print(agent.generate_weekly_schedule())