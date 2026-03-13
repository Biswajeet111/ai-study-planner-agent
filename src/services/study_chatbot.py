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


def _local_chat_reply(question, schedule_data):
    subjects = []
    if isinstance(schedule_data, dict):
        daily_plan = schedule_data.get("daily_plan", {})
        subjects = list(daily_plan.keys())

    subject_hint = ", ".join(subjects[:3]) if subjects else "your highest-priority subject"
    return (
        f"Based on your current plan, start with {subject_hint}, then use 25-30 minute focus blocks. "
        f"After each block, write 3 quick recall points. For your question '{question}', "
        "apply the topic to one practice problem and review mistakes immediately."
    )


def study_chat(question, schedule_data):
    if client is None:
        return _local_chat_reply(question, schedule_data)

    prompt = f"""
You are an AI study tutor.

Student study schedule:
{schedule_data}

Student question:
{question}

Answer the question using the schedule data.
Give helpful study advice.
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a helpful AI study tutor."},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content
    except Exception:
        return _local_chat_reply(question, schedule_data)
