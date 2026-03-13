import json
import os

fp = r'e:\ai-study-planner-agent\notebooks\model_training.ipynb'
with open(fp, 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb.get('cells', []):
    if cell.get('cell_type') == 'code':
        # Check if pd.read_csv is in source
        for i, line in enumerate(cell['source']):
            if 'pd.read_csv' in line:
                cell['source'][i] = line.replace('"Student_Performance.csv"', '"../data/Student_Performance.csv"').replace("'Student_Performance.csv'", "'../data/Student_Performance.csv'")
                # Clear outputs to remove the error
                cell['outputs'] = []

with open(fp, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)
