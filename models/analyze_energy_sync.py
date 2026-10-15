import csv
import json
import subprocess
from pathlib import Path

CSV_PATH = "data/energy-data.csv"
DATABASE = "datacenter-challenge-db"
METRIC_NAME = "business_electricity_price"


def load_source():
    """Read the curated CSV source."""
    with open(CSV_PATH, encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def load_persisted_metrics():
    """Read the current metric state from local D1 through Wrangler."""
    sql = """
    SELECT
        c.name AS country,
        m.metric_name,
        m.period,
        m.value,
        m.unit,
        s.source_url
    FROM metrics m
    JOIN countries c ON c.id = m.country_id
    LEFT JOIN sources s ON s.id = m.source_id
    WHERE m.metric_name = 'business_electricity_price';
    """

    query_file = Path("database/sync_read_query.sql")
    query_file.write_text(sql, encoding="utf-8")

    command = [
        r"C:\Program Files\nodejs\npx.cmd",
        "wrangler",
        "d1",
        "execute",
        DATABASE,
        "--local",
        "--json",
        f"--file={query_file}",
    ]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
        shell=True,
    )

    if result.returncode != 0:
        print("WRANGLER STDOUT:")
        print(result.stdout)
        print("WRANGLER STDERR:")
        print(result.stderr)
        raise RuntimeError(
            f"Wrangler failed with exit code {result.returncode}"
        )

    payload = json.loads(result.stdout)
    return payload[0]["results"]


def logical_key(country, metric_name, period):
    return (country, metric_name, period)


def main():
    source_rows = load_source()
    persisted_rows = load_persisted_metrics()

    persisted_index = {}

    for row in persisted_rows:
        key = logical_key(
            row["country"],
            row["metric_name"],
            row["period"],
        )
        persisted_index[key] = row

    counts = {
        "NEW": 0,
        "UNCHANGED": 0,
        "CHANGED": 0,
        "UNKNOWN": 0,
    }

    for row in source_rows:
        country = row["country"]
        period = row["price_period"]
        raw_value = row["business_price_usd_per_kwh"]

        if raw_value is None or raw_value.strip() == "":
            state = "UNKNOWN"

        else:
            source_value = float(raw_value)

            key = logical_key(
                country,
                METRIC_NAME,
                period,
            )

            persisted = persisted_index.get(key)

            if persisted is None:
                state = "NEW"

            else:
                same_value = source_value == float(persisted["value"])
                same_unit = persisted["unit"] == "USD/kWh"
                same_source = (
                    row["price_source_url"] == persisted["source_url"]
                )

                if same_value and same_unit and same_source:
                    state = "UNCHANGED"
                else:
                    state = "CHANGED"

        counts[state] += 1
        print(f"{country:<20} {state}")

    print("\nSynchronization Summary")
    print("-----------------------")

    for state, count in counts.items():
        print(f"{state:<10} {count}")


if __name__ == "__main__":
    main()
