from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict

app = FastAPI(title="AI Driven Impact Analyzer")

# Input model: changed files from a PR
class PRInput(BaseModel):
    changed_files: List[str]

# Dummy coverage mapping (for prototype)
COVERAGE_MAP = {
    "auth.py": ["test_login", "test_auth_flow"],
    "payment.py": ["test_payment_flow", "test_invoice"],
    "db.py": ["test_db_connection", "test_migrations"]
}

@app.get("/")
def root():
    return {"message": "AI Impact Analyzer API is running 🚀"}

@app.post("/analyze")
def analyze_pr(pr: PRInput):
    selected_tests = []
    reasons = {}

    for file in pr.changed_files:
        if file in COVERAGE_MAP:
            tests = COVERAGE_MAP[file]
            selected_tests.extend(tests)
            reasons[file] = tests

    # remove duplicates
    selected_tests = list(set(selected_tests))

    return {
        "selected_tests": selected_tests,
        "reasons": reasons,
        "time_saved": "65%",
        "risk_score": "Medium"
    }
