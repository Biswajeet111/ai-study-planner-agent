import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_insights(subjects, priority, daily_plan):

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

    response = client.chat.completions.create(
       model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are a helpful AI study coach."},
            {"role": "user", "content": prompt}
        ]
    )

    return response.choices[0].message.content

def explain_plan(priority, daily_plan, weekly_schedule):

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

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You explain study plans clearly."},
            {"role": "user", "content": prompt}
        ]
    )

    return response.choices[0].message.content