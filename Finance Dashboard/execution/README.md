# Layer 3: Execution Scripts - Finance Dashboard

This directory contains deterministic Python scripts that perform specific financial data fetching, calculations, and transformations.

## Guidelines for Execution Scripts

- Scripts handle API calls, data processing, calculations, and intermediate file outputs.
- Always load environment variables and API keys from `.env`.
- Write intermediate output files to `.tmp/`.
- Ensure scripts are deterministic, well-commented, robustly handle errors, and return clear exit status and error tracebacks.

## Script Template

```python
import os
import sys
from dotenv import load_dotenv

load_dotenv()

def main():
    # Deterministic logic here
    pass

if __name__ == "__main__":
    main()
```
