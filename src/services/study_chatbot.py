import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def study_chat(question, schedule_data):

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
3. Provide actionable, helpful study advice.
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        temperature=0.7,
        messages=[
            {"role": "system", "content": "You are StudyForge AI, a helpful AI study tutor."},
            {"role": "user", "content": prompt}
        ]
    )

    return response.choices[0].message.content