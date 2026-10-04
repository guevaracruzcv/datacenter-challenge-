import csv
from pathlib import Path

INPUT = Path("data/energy-data.csv")
OUTPUT = Path("database/seed_energy_additional.sql")


def sql_text(value):
    if value is None or str(value).strip() == "":
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"


METRICS = [
    {
        "csv_field": "total_energy_consumption_exajoules",
        "metric_name": "total_energy_consumption",
        "unit": "EJ",
        "period_field": "total_energy_consumption_year",
        "source_field": "consumption_source_url",
        "source_name": "Total energy consumption",
        "publisher": "Worldometer",
        "notes_field": "notes",
    },
    {
        "csv_field": "electricity_generation_solar_pct",
        "metric_name": "electricity_generation_solar_share",
        "unit": "%",
        "period_field": "mix_year",
        "source_field": "mix_source_url",
        "source_name": "Electricity generation mix",
        "publisher": "Our World in Data",
        "notes_field": "mix_notes",
    },
    {
        "csv_field": "electricity_generation_wind_pct",
        "metric_name": "electricity_generation_wind_share",
        "unit": "%",
        "period_field": "mix_year",
        "source_field": "mix_source_url",
        "source_name": "Electricity generation mix",
        "publisher": "Our World in Data",
        "notes_field": "mix_notes",
    },
    {
        "csv_field": "electricity_generation_hydro_pct",
        "metric_name": "electricity_generation_hydro_share",
        "unit": "%",
        "period_field": "mix_year",
        "source_field": "mix_source_url",
        "source_name": "Electricity generation mix",
        "publisher": "Our World in Data",
        "notes_field": "mix_notes",
    },
    {
        "csv_field": "electricity_net_imports_twh",
        "metric_name": "electricity_net_imports",
        "unit": "TWh",
        "period_field": "electricity_production_trade_year",
        "source_field": "electricity_production_trade_source_url",
        "source_name": "Electricity production and trade",
        "publisher": "U.S. EIA",
        "notes_field": "production_trade_notes",
    },
]


with INPUT.open(encoding="utf-8", newline="") as f:
    rows = list(csv.DictReader(f))


sql = [
    "-- Incremental energy evidence generated from data/energy-data.csv",
    "-- Adds consumption, generation mix and electricity trade evidence",
    "-- Does not re-import business electricity prices",
    "BEGIN TRANSACTION;",
    ""
]

metric_count = 0
unknown_count = 0

for row in rows:
    country = row["country"].strip()
    retrieved = row["accessed_date"].strip()

    for definition in METRICS:
        value = row[definition["csv_field"]].strip()

        if value == "":
            unknown_count += 1
            sql.append(
                f"-- UNKNOWN: {definition['metric_name']} unavailable for {country}"
            )
            continue

        period = row[definition["period_field"]].strip()
        source_url = row[definition["source_field"]].strip()
        notes = row[definition["notes_field"]].strip()

        source_label = (
            f"{definition['source_name']} - {country}"
        )

        sql.append(
            "INSERT INTO sources "
            "(name, source_url, publisher, retrieved_at, notes) "
            f"VALUES ({sql_text(source_label)}, "
            f"{sql_text(source_url)}, "
            f"{sql_text(definition['publisher'])}, "
            f"{sql_text(retrieved)}, "
            f"{sql_text('Source recorded in energy-data.csv')});"
        )

        sql.append(
            "INSERT INTO metrics "
            "(country_id, metric_name, value, unit, period, "
            "evidence_type, source_id, notes) "
            "VALUES ("
            f"(SELECT id FROM countries WHERE name={sql_text(country)}), "
            f"{sql_text(definition['metric_name'])}, "
            f"{float(value)}, "
            f"{sql_text(definition['unit'])}, "
            f"{sql_text(period)}, "
            f"{sql_text('fact')}, "
            "last_insert_rowid(), "
            f"{sql_text(notes)}"
            ");"
        )

        metric_count += 1

    sql.append("")

sql.append("COMMIT;")

OUTPUT.write_text("\n".join(sql), encoding="utf-8")

print(f"Countries processed: {len(rows)}")
print(f"Additional metrics generated: {metric_count}")
print(f"Unknown values preserved: {unknown_count}")
print(f"SQL written to: {OUTPUT}")
