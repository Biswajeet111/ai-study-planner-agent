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
You are StudyForge AI, an expert, helpful AI study tutor.
Below is the student's study schedule and data:
---
{schedule_data}
---

Student question:
{question}

Instructions:
1. Answer the student's question directly and concisely.
2. Only reference the schedule data if it is relevant to the student's specific question. Do NOT summarize or repeat the entire schedule unless asked.
3. Provide actionable, helpful study advice with an encouraging tone.
4. Ensure your response is creative, dynamic, and distinct from previous interactions.
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
    except Exception as e:
        return _local_chat_reply(question, schedule_data)