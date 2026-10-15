import json
import sys
from pathlib import Path

if len(sys.argv) != 2:
    print("Usage: python validate_climate.py <json_file>")
    sys.exit(1)

file_path = Path(sys.argv[1])

if not file_path.exists():
    print(f"ERROR: File not found: {file_path}")
    sys.exit(1)

# 2. Load the JSON response
with file_path.open("r", encoding="utf-8") as file:
    data = json.load(file)

# 3. Check required top-level fields
required_fields = [
    "latitude",
    "longitude",
    "hourly_units",
    "hourly"
]

for field in required_fields:
    assert field in data, f"Missing required field: {field}"

# 4. Check required climate variables
hourly = data["hourly"]
units = data["hourly_units"]

required_variables = [
    "time",
    "temperature_2m",
    "relative_humidity_2m"
]

for variable in required_variables:
    assert variable in hourly, f"Missing climate variable: {variable}"

# 5. Check expected units
assert units["temperature_2m"] == "°C", \
    "Unexpected temperature unit"

assert units["relative_humidity_2m"] == "%", \
    "Unexpected humidity unit"

# 6. Check observation counts
times = hourly["time"]
temperatures = hourly["temperature_2m"]
humidities = hourly["relative_humidity_2m"]

assert len(times) == len(temperatures) == len(humidities), \
    "Observation arrays have different lengths"

assert len(times) > 0, \
    "No climate observations returned"

# 7. Check for missing values
assert all(value is not None for value in temperatures), \
    "Missing temperature observation"

assert all(value is not None for value in humidities), \
    "Missing humidity observation"

print("Climate evidence validation: PASSED")
print(f"Observations: {len(times)}")
print(f"Temperature unit: {units['temperature_2m']}")
print(f"Humidity unit: {units['relative_humidity_2m']}")
print(f"Returned coordinates: {data['latitude']}, {data['longitude']}")