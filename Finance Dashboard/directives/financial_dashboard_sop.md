# Directive: Financial Data Processing & Dashboard Management

## Overview
Standard Operating Procedure for parsing financial datasets, computing portfolio KPIs (Revenue, Expenses, Net Profit, Profit Margin, Asset Growth), saving structured intermediate data to `.tmp/`, and outputting summarized metrics for dashboard visualization.

## Inputs
- Input data files: CSV, JSON, or API data streams stored in `.tmp/input_data/`
- Environment settings configured in `.env`

## Workflow & Execution Scripts
1. Run `execution/fetch_finance_data.py --input <data_path>` to validate and parse raw financial transactions.
2. Intermediates: Output processed summary to `.tmp/processed_finance_summary.json`.
3. Verify all metrics and financial totals balance cleanly.

## Error Handling & Edge Cases
- Missing columns or invalid data types: validate schema before processing.
- Missing API Keys: fallback to local mock data generation in `.tmp/` for development testing.
- Self-annealing: log parse errors to `.tmp/errors.log` and adjust execution rules accordingly.
