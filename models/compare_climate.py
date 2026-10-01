import json
from pathlib import Path
from statistics import mean

locations = [
    {
        "country": "Indonesia",
        "location": "Jakarta",
        "file": "../data/climate/jakarta_2025.json"
    },
    {
        "country": "Brazil",
        "location": "Brasilia",
        "file": "../data/climate/brasilia_2025.json"
    },
    {
        "country": "Canada",
        "location": "Ottawa",
        "file": "../data/climate/ottawa_2025.json"
    }
]

print("Comparative Climate Evidence — 2025")
print("-" * 90)

results = []

for location in locations:

    file_path = Path(location["file"])

    with file_path.open("r", encoding="utf-8") as file:
        data = json.load(file)

    temperatures = data["hourly"]["temperature_2m"]
    humidities = data["hourly"]["relative_humidity_2m"]

    result = {
        "country": location["country"],
        "reference_location": location["location"],
        "period": "2025",
        "observations": len(temperatures),
        "latitude": data["latitude"],
        "longitude": data["longitude"],
        "mean_temperature_c": round(mean(temperatures), 2),
        "min_temperature_c": round(min(temperatures), 2),
        "max_temperature_c": round(max(temperatures), 2),
        "mean_relative_humidity_pct": round(mean(humidities), 2),
        "source_evidence": {
    "provider": "Open-Meteo",
    "dataset": "Historical Weather API",
    "source_url": "https://archive-api.open-meteo.com/v1/archive",
    "retrieval_date": "2026-10-01",
    "evidence_type": "fact"
},

"calculation": {
    "type": "descriptive_statistics",
    "derived_fields": [
        "mean_temperature_c",
        "min_temperature_c",
        "max_temperature_c",
        "mean_relative_humidity_pct"
    ],
    "evidence_type": "calculation"
},

"limitation": "Reference-location screening evidence; not a proposed data center site."
    }

    results.append(result)

    print(
        f"{location['country']:10} | "
        f"{location['location']:10} | "
        f"Mean Temp: {mean(temperatures):6.2f} °C | "
        f"Min: {min(temperatures):6.2f} °C | "
        f"Max: {max(temperatures):6.2f} °C | "
        f"Mean RH: {mean(humidities):6.2f} %"
    )

output = {
    "dataset": "Comparative Climate Evidence",
    "period": "2025",
    "candidate_count": len(results),
    "candidates": results
}

output_path = Path("../data/climate/climate_summary.json")

with output_path.open("w", encoding="utf-8") as file:
    json.dump(output, file, indent=2, ensure_ascii=False)

print()
print(f"Structured climate summary saved to: {output_path}")