import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def study_chat(question, schedule_data):

    prompt = f"""
You are an AI study tutor.

Student study schedule:
{schedule_data}

Student question:
{question}

Answer the question using the schedule data.
Give helpful study advice.
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are a helpful AI study tutor."},
            {"role": "user", "content": prompt}
        ]
    )

    return response.choices[0].message.content