# SOP: Typing Speed Game Management & Analytics

## Goal
Provide a standard procedure for maintaining the Typing Speed Game wordbanks, validating typing metrics calculations (WPM, CPM, Accuracy), parsing session log output, and keeping performance presets up to date.

## Calculation Standards

1. **Words Per Minute (WPM)**:
   $$\text{WPM} = \frac{\text{Correct Characters} / 5}{\text{Time elapsed in minutes}}$$
   *Standard definition: 1 word = 5 characters.*

2. **Characters Per Minute (CPM)**:
   $$\text{CPM} = \frac{\text{Correct Characters}}{\text{Time elapsed in minutes}}$$

3. **Net Accuracy (%)**:
   $$\text{Accuracy} = \frac{\text{Correct Keystrokes}}{\text{Total Keystrokes}} \times 100$$

4. **Raw WPM**:
   $$\text{Raw WPM} = \frac{\text{Total Typed Characters} / 5}{\text{Time elapsed in minutes}}$$

## Operational Tasks & Tools

- **Wordbank Generation**: Run `execution/generate_texts.py` to regenerate JSON wordlists and quotes into `webapp/js/words.js`.
- **Session Analysis**: Run `execution/calculate_stats.py` with session JSON payloads saved in `.tmp/` to output detailed statistical metrics and identify weak keys for finger practice.
