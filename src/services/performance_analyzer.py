from pathlib import Path

import joblib
import pandas as pd

MODEL_PATH = Path("src/models/performance_model.pkl")


def _load_model():
    if not MODEL_PATH.exists():
        return None

    try:
        return joblib.load(MODEL_PATH)
    except Exception:
        return None


model = _load_model()


def _fallback_score(hours_studied, previous_scores, sleep_hours, sample_papers_practiced):
    # Lightweight deterministic fallback so API works without trained model file.
    score = (
        0.45 * previous_scores
        + 5.0 * hours_studied
        + 2.2 * sample_papers_practiced
        + 1.5 * sleep_hours
    )
    return round(max(0.0, min(100.0, score)), 2)


def predict_performance(hours_studied, previous_scores, sleep_hours, sample_papers_practiced):
    if model is None:
        return _fallback_score(hours_studied, previous_scores, sleep_hours, sample_papers_practiced)

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
