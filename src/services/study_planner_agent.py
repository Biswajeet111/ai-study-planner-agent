from collections import defaultdict
from src.services.performance_analyzer import predict_performance


class StudyPlannerAgent:
    def __init__(self, subjects, daily_hours):
        """
        subjects = list of dict
        example:
        [
            {
                "name": "Math",
                "difficulty": 4,
                "previous_score": 60,
                "study_hours": 5,
                "sleep_hours": 7,
                "practice_papers": 3
            }
        ]
        """
        self.subjects = subjects
        self.daily_hours = daily_hours

    def calculate_priority(self):
        priorities = []

        for sub in self.subjects:
            predicted_score = predict_performance(
                hours_studied=sub["study_hours"],
                previous_scores=sub["previous_score"],
                sleep_hours=sub["sleep_hours"],
                sample_papers_practiced=sub["practice_papers"]
            )

            risk = 100 - predicted_score
            priority = risk + (sub["difficulty"] * 5)

            priorities.append({
                "subject": sub["name"],
                "predicted_score": predicted_score,
                "risk": round(risk, 2),
                "priority": round(priority, 2)
            })

        return sorted(priorities, key=lambda x: x["priority"], reverse=True)

    def generate_daily_plan(self):
        priorities = self.calculate_priority()
        total_priority = sum(item["priority"] for item in priorities)

        schedule = {}

        for item in priorities:
            allocated_hours = round((item["priority"] / total_priority) * self.daily_hours, 2)
            schedule[item["subject"]] = allocated_hours

        return schedule

    def generate_weekly_schedule(self):
        daily_plan = self.generate_daily_plan()
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

        weekly_schedule = defaultdict(dict)

        for day in days:
            for subject, hours in daily_plan.items():
                weekly_schedule[day][subject] = hours

        return weekly_schedule