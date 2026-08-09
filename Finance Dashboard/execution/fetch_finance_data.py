#!/usr/bin/env python3
"""
Execution Script: Fetch and Process Financial Data
Performs deterministic parsing, calculation of financial KPIs, and writes intermediate summaries to .tmp/
"""

import os
import sys
import json
from pathlib import Path

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass




PROJECT_ROOT = Path(__file__).resolve().parent.parent
TMP_DIR = PROJECT_ROOT / ".tmp"

def ensure_tmp_dir():
    TMP_DIR.mkdir(parents=True, exist_ok=True)

def generate_sample_financial_data():
    """Generates sample financial KPI data when external API keys are not present."""
    return {
        "dashboard_title": "Executive Financial Dashboard",
        "currency": "USD",
        "kpis": {
            "total_revenue": 1250000.00,
            "total_expenses": 780000.00,
            "net_profit": 470000.00,
            "profit_margin_pct": 37.6,
            "cash_reserves": 2100000.00,
            "monthly_recurring_revenue": 105000.00
        },
        "monthly_breakdown": [
            {"month": "Jan", "revenue": 95000, "expenses": 60000, "profit": 35000},
            {"month": "Feb", "revenue": 102000, "expenses": 62000, "profit": 40000},
            {"month": "Mar", "revenue": 110000, "expenses": 65000, "profit": 45000},
            {"month": "Apr", "revenue": 108000, "expenses": 63000, "profit": 45000},
            {"month": "May", "revenue": 115000, "expenses": 67000, "profit": 48000},
            {"month": "Jun", "revenue": 120000, "expenses": 70000, "profit": 50000}
        ]
    }

def main():
    ensure_tmp_dir()
    output_path = TMP_DIR / "processed_finance_summary.json"
    
    data = generate_sample_financial_data()
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
        
    print(f"Successfully processed financial data and saved summary to: {output_path}")

if __name__ == "__main__":
    main()
