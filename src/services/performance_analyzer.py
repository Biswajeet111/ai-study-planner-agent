import joblib
import pandas as pd

MODEL_PATH = "src/models/performance_model.pkl"

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