import os
import joblib
import pandas as pd
import requests

MODEL_PATH = "src/models/performance_model.pkl"
MODEL_URL = "https://huggingface.co/Biswajeet1/study_forge/resolve/main/performance_model.pkl"

# Download model if not present
if not os.path.exists(MODEL_PATH):
    os.makedirs("src/models", exist_ok=True)

    print("Downloading ML model...")
    r = requests.get(MODEL_URL)

    with open(MODEL_PATH, "wb") as f:
        f.write(r.content)

model = joblib.load(MODEL_PATH)


def predict_performance(hours_studied, previous_scores, sleep_hours, sample_papers_practiced):

    input_data = pd.DataFrame(
        [[hours_studied, previous_scores, sleep_hours, sample_papers_practiced]],
        columns=[
            "Hours Studied",
            "Previous Scores",
            "Sleep Hours",
            "Sample Question Papers Practiced"
        ]
    )

    prediction = model.predict(input_data)

    return round(float(prediction[0]), 2)