import json
import sys
import math

def calculate_typing_stats(session_data):
    """
    Calculates detailed typing statistics from a session payload.
    Expected fields:
      - duration_sec (number)
      - total_keystrokes (int)
      - correct_keystrokes (int)
      - incorrect_keystrokes (int)
      - timeline (list of WPM data per second)
    """
    duration = session_data.get("duration_sec", 60)
    total_keys = session_data.get("total_keystrokes", 0)
    correct_keys = session_data.get("correct_keystrokes", 0)
    incorrect_keys = session_data.get("incorrect_keystrokes", 0)
    timeline = session_data.get("timeline", [])

    time_in_minutes = duration / 60.0 if duration > 0 else 1.0

    net_wpm = round((correct_keys / 5.0) / time_in_minutes, 2)
    cpm = round(correct_keys / time_in_minutes, 2)
    raw_wpm = round((total_keys / 5.0) / time_in_minutes, 2)
    accuracy = round((correct_keys / total_keys * 100.0), 2) if total_keys > 0 else 0.0

    # Consistency / Standard Deviation
    wpm_values = [item.get("wpm", 0) for item in timeline] if timeline else [net_wpm]
    mean_wpm = sum(wpm_values) / len(wpm_values) if wpm_values else 0
    variance = sum((x - mean_wpm) ** 2 for x in wpm_values) / len(wpm_values) if wpm_values else 0
    std_dev = math.sqrt(variance)
    consistency = max(0, round(100 - (std_dev / (mean_wpm + 1e-5) * 100), 1))

    return {
        "net_wpm": net_wpm,
        "raw_wpm": raw_wpm,
        "cpm": cpm,
        "accuracy_percent": accuracy,
        "consistency_percent": consistency,
        "total_keystrokes": total_keys,
        "correct_keystrokes": correct_keys,
        "incorrect_keystrokes": incorrect_keys
    }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        result = calculate_typing_stats(data)
        print(json.dumps(result, indent=2))
    else:
        # Sample run
        sample = {
            "duration_sec": 60,
            "total_keystrokes": 300,
            "correct_keystrokes": 285,
            "incorrect_keystrokes": 15,
            "timeline": [{"sec": i, "wpm": 50 + (i % 5)} for i in range(1, 61)]
        }
        result = calculate_typing_stats(sample)
        print("Sample Statistics Output:")
        print(json.dumps(result, indent=2))
