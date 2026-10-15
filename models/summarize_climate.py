import json
import sys
from pathlib import Path
from statistics import mean

if len(sys.argv) != 2:
    print("Usage: python summarize_climate.py <json_file>")
    sys.exit(1)

file_path = Path(sys.argv[1])

if not file_path.exists():
    print(f"ERROR: File not found: {file_path}")
    sys.exit(1)

with file_path.open("r", encoding="utf-8") as file:
    data = json.load(file)

temperatures = data["hourly"]["temperature_2m"]
humidities = data["hourly"]["relative_humidity_2m"]

temperature_summary = {
    "mean": mean(temperatures),
    "min": min(temperatures),
    "max": max(temperatures)
}

humidity_summary = {
    "mean": mean(humidities),
    "min": min(humidities),
    "max": max(humidities)
}

print("Climate Evidence Summary")
print("------------------------")

print(f"Observations: {len(temperatures)}")

print()
print("Temperature")
print(f"Mean: {temperature_summary['mean']:.2f} °C")
print(f"Min:  {temperature_summary['min']:.2f} °C")
print(f"Max:  {temperature_summary['max']:.2f} °C")

print()
print("Relative Humidity")
print(f"Mean: {humidity_summary['mean']:.2f} %")
print(f"Min:  {humidity_summary['min']:.2f} %")
print(f"Max:  {humidity_summary['max']:.2f} %")

print()
print(
    f"Coordinates: {data['latitude']}, {data['longitude']}"
)