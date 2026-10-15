import csv
from pathlib import Path

INPUT = Path("data/energy-data.csv")
OUTPUT = Path("database/seed_energy.sql")


def sql_text(value):
    if value is None:
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"


with INPUT.open(encoding="utf-8", newline="") as f:
    rows = list(csv.DictReader(f))


sql = [
    "-- Generated from data/energy-data.csv",
    "-- Initial evidence: business electricity prices",
    "BEGIN TRANSACTION;",
    ""
]

metric_count = 0
unknown_count = 0

for row in rows:
    country = row["country"].strip()
    price = row["business_price_usd_per_kwh"].strip()
    period = row["price_period"].strip()
    source_url = row["price_source_url"].strip()
    retrieved = row["accessed_date"].strip()

    # Country identity
    sql.append(
        f"INSERT OR IGNORE INTO countries (name) "
        f"VALUES ({sql_text(country)});"
    )

    # Provenance
    sql.append(
        "INSERT INTO sources "
        "(name, source_url, publisher, retrieved_at, notes) "
        f"VALUES ({sql_text('Business electricity price - ' + country)}, "
        f"{sql_text(source_url)}, "
        f"{sql_text('GlobalPetrolPrices.com')}, "
        f"{sql_text(retrieved)}, "
        f"{sql_text('Source recorded in energy-data.csv')});"
    )

    # Missing price remains unknown; never convert to zero.
    if price == "":
        unknown_count += 1
        sql.append(
            f"-- UNKNOWN: business electricity price unavailable for {country}"
        )
    else:
        sql.append(
            "INSERT INTO metrics "
            "(country_id, metric_name, value, unit, period, "
            "evidence_type, source_id, notes) "
            "VALUES ("
            f"(SELECT id FROM countries WHERE name={sql_text(country)}), "
            f"{sql_text('business_electricity_price')}, "
            f"{float(price)}, "
            f"{sql_text('USD/kWh')}, "
            f"{sql_text(period)}, "
            f"{sql_text('fact')}, "
            "last_insert_rowid(), "
            f"{sql_text('National business electricity price; not a site-specific data center tariff.')}"
            ");"
        )
        metric_count += 1

    sql.append("")

sql.append("COMMIT;")

OUTPUT.write_text("\n".join(sql), encoding="utf-8")

print(f"Countries processed: {len(rows)}")
print(f"Metrics generated: {metric_count}")
print(f"Unknown prices preserved: {unknown_count}")
print(f"SQL written to: {OUTPUT}")
