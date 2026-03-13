import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()


def _create_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None

    try:
        return Groq(api_key=api_key)
    except Exception:
        return None


client = _create_client()


def _local_insights(subjects, priority, daily_plan):
    top_subject = priority[0]["subject"] if priority else "your hardest subject"
    total_hours = sum(daily_plan.values()) if daily_plan else 0
    return (
        f"1) Start with {top_subject} while your energy is highest. "
        f"2) Keep short revision blocks at the end of each session. "
        f"3) Use active recall after every practice paper. "
        f"4) Protect sleep quality to sustain performance. "
        f"5) Review progress weekly against your {round(total_hours, 2)} planned daily hours."
    )


def generate_insights(subjects, priority, daily_plan):
    if client is None:
        return _local_insights(subjects, priority, daily_plan)

    prompt = f"""
You are an AI study coach.

Subjects:
{subjects}

Priority Analysis:
{priority}

Daily Study Plan:
{daily_plan}

Give 3-5 short actionable suggestions to improve study performance.
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a helpful AI study coach."},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content
    except Exception:
        return _local_insights(subjects, priority, daily_plan)


def explain_plan(priority, daily_plan, weekly_schedule):
    if client is None:
        focus_subject = priority[0]["subject"] if priority else "key subjects"
        return (
            f"The schedule gives more time to {focus_subject} because it has higher risk and priority. "
            "Daily hours are distributed by priority weight so weaker subjects get more attention, "
            "while still keeping all subjects in the weekly loop."
        )

    prompt = f"""
You are an AI study coach.

Priority Analysis:
{priority}

Daily Plan:
{daily_plan}

Weekly Schedule:
{weekly_schedule}

Explain in simple terms why this study plan was generated.
Highlight which subjects need more focus and why.
Give a short explanation.
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You explain study plans clearly."},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content
    except Exception:
        return "This plan prioritizes high-risk subjects first and balances all subjects across the week."


def motivation_message(progress_score):
    if client is None:
        if progress_score >= 80:
            return "Excellent momentum. Keep this consistency and you will outperform your targets."
        if progress_score >= 50:
            return "Solid effort. A little more focus each day will create a big jump soon."
        return "You are not behind, you are building. Start small today and keep showing up."

    prompt = f"Student progress is {progress_score}%. Give a short motivational message."

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
    except Exception:
        return "Stay consistent and trust the process. Every focused session moves you forward."
