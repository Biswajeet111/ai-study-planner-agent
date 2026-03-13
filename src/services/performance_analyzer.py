import joblib
import pandas as pd

from huggingface_hub import hf_hub_download


MODEL_REPO = "Biswajeet1/study_forge"
MODEL_FILE = "performance_model.pkl"

model = None

try:
    model_path = hf_hub_download(
        repo_id=MODEL_REPO,
        filename=MODEL_FILE
    )

    model = joblib.load(model_path)

    print("Model loaded from Hugging Face")

except Exception as e:

    print("Model loading failed:", e)
    model = None


def predict_performance(hours_studied, previous_scores, sleep_hours, sample_papers_practiced):

    if model is None:
        # fallback
        return previous_scores

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