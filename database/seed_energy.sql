-- Generated from data/energy-data.csv
-- Initial evidence: business electricity prices
BEGIN TRANSACTION;

INSERT OR IGNORE INTO countries (name) VALUES ('China');
INSERT INTO sources (name, source_url, publisher, retrieved_at, notes) VALUES ('Business electricity price - China', 'https://www.globalpetrolprices.com/China/electricity_prices/', 'GlobalPetrolPrices.com', '2026-09-16', 'Source recorded in energy-data.csv');
INSERT INTO metrics (country_id, metric_name, value, unit, period, evidence_type, source_id, notes) VALUES ((SELECT id FROM countries WHERE name='China'), 'business_electricity_price', 0.117, 'USD/kWh', '2025-12', 'fact', last_insert_rowid(), 'National business electricity price; not a site-specific data center tariff.');

INSERT OR IGNORE INTO countries (name) VALUES ('United States');
INSERT INTO sources (name, source_url, publisher, retrieved_at, notes) VALUES ('Business electricity price - United States', 'https://www.globalpetrolprices.com/USA/electricity_prices/', 'GlobalPetrolPrices.com', '2026-09-16', 'Source recorded in energy-data.csv');
INSERT INTO metrics (country_id, metric_name, value, unit, period, evidence_type, source_id, notes) VALUES ((SELECT id FROM countries WHERE name='United States'), 'business_electricity_price', 0.145, 'USD/kWh', '2025-12', 'fact', last_insert_rowid(), 'National business electricity price; not a site-specific data center tariff.');

INSERT OR IGNORE INTO countries (name) VALUES ('India');
INSERT INTO sources (name, source_url, publisher, retrieved_at, notes) VALUES ('Business electricity price - India', 'https://www.globalpetrolprices.com/India/electricity_prices/', 'GlobalPetrolPrices.com', '2026-09-16', 'Source recorded in energy-data.csv');
INSERT INTO metrics (country_id, metric_name, value, unit, period, evidence_type, source_id, notes) VALUES ((SELECT id FROM countries WHERE name='India'), 'business_electricity_price', 0.109, 'USD/kWh', '2025-12', 'fact', last_insert_rowid(), 'National business electricity price; not a site-specific data center tariff.');

INSERT OR IGNORE INTO countries (name) VALUES ('Russia');
INSERT INTO sources (name, source_url, publisher, retrieved_at, notes) VALUES ('Business electricity price - Russia', 'https://www.globalpetrolprices.com/Russia/electricity_prices/', 'GlobalPetrolPrices.com', '2026-09-16', 'Source recorded in energy-data.csv');
INSERT INTO metrics (country_id, metric_name, value, unit, period, evidence_type, source_id, notes) VALUES ((SELECT id FROM countries WHERE name='Russia'), 'business_electricity_price', 0.124, 'USD/kWh', '2025-12', 'fact', last_insert_rowid(), 'National business electricity price; not a site-specific data center tariff.');

INSERT OR IGNORE INTO countries (name) VALUES ('Japan');
INSERT INTO sources (name, source_url, publisher, retrieved_at, notes) VALUES ('Business electricity price - Japan', 'https://www.globalpetrolprices.com/Japan/electricity_prices/', 'GlobalPetrolPrices.com', '2026-09-16', 'Source recorded in energy-data.csv');
INSERT INTO metrics (country_id, metric_name, value, unit, period, evidence_type, source_id, notes) VALUES ((SELECT id FROM countries WHERE name='Japan'), 'business_electricity_price', 0.185, 'USD/kWh', '2025-12', 'fact', last_insert_rowid(), 'National business electricity price; not a site-specific data center tariff.');

INSERT OR IGNORE INTO countries (name) VALUES ('Iran');
INSERT INTO sources (name, source_url, publisher, retrieved_at, notes) VALUES ('Business electricity price - Iran', 'https://www.globalpetrolprices.com/Iran/electricity_prices/', 'GlobalPetrolPrices.com', '2026-09-16', 'Source recorded in energy-data.csv');
-- UNKNOWN: business electricity price unavailable for Iran

INSERT OR IGNORE INTO countries (name) VALUES ('Canada');
INSERT INTO sources (name, source_url, publisher, retrieved_at, notes) VALUES ('Business electricity price - Canada', 'https://www.globalpetrolprices.com/Canada/electricity_prices/', 'GlobalPetrolPrices.com', '2026-09-16', 'Source recorded in energy-data.csv');
INSERT INTO metrics (country_id, metric_name, value, unit, period, evidence_type, source_id, notes) VALUES ((SELECT id FROM countries WHERE name='Canada'), 'business_electricity_price', 0.115, 'USD/kWh', '2025-12', 'fact', last_insert_rowid(), 'National business electricity price; not a site-specific data center tariff.');

INSERT OR IGNORE INTO countries (name) VALUES ('South Korea');
INSERT INTO sources (name, source_url, publisher, retrieved_at, notes) VALUES ('Business electricity price - South Korea', 'https://www.globalpetrolprices.com/South-Korea/electricity_prices/', 'GlobalPetrolPrices.com', '2026-09-16', 'Source recorded in energy-data.csv');
INSERT INTO metrics (country_id, metric_name, value, unit, period, evidence_type, source_id, notes) VALUES ((SELECT id FROM countries WHERE name='South Korea'), 'business_electricity_price', 0.118, 'USD/kWh', '2025-12', 'fact', last_insert_rowid(), 'National business electricity price; not a site-specific data center tariff.');

INSERT OR IGNORE INTO countries (name) VALUES ('Saudi Arabia');
INSERT INTO sources (name, source_url, publisher, retrieved_at, notes) VALUES ('Business electricity price - Saudi Arabia', 'https://www.globalpetrolprices.com/Saudi-Arabia/electricity_prices/', 'GlobalPetrolPrices.com', '2026-09-16', 'Source recorded in energy-data.csv');
INSERT INTO metrics (country_id, metric_name, value, unit, period, evidence_type, source_id, notes) VALUES ((SELECT id FROM countries WHERE name='Saudi Arabia'), 'business_electricity_price', 0.074, 'USD/kWh', '2025-12', 'fact', last_insert_rowid(), 'National business electricity price; not a site-specific data center tariff.');

INSERT OR IGNORE INTO countries (name) VALUES ('Indonesia');
INSERT INTO sources (name, source_url, publisher, retrieved_at, notes) VALUES ('Business electricity price - Indonesia', 'https://www.globalpetrolprices.com/Indonesia/electricity_prices/?trp-edit-translation=preview', 'GlobalPetrolPrices.com', '2026-09-16', 'Source recorded in energy-data.csv');
INSERT INTO metrics (country_id, metric_name, value, unit, period, evidence_type, source_id, notes) VALUES ((SELECT id FROM countries WHERE name='Indonesia'), 'business_electricity_price', 0.063, 'USD/kWh', '2025-12', 'fact', last_insert_rowid(), 'National business electricity price; not a site-specific data center tariff.');

INSERT OR IGNORE INTO countries (name) VALUES ('Brazil');
INSERT INTO sources (name, source_url, publisher, retrieved_at, notes) VALUES ('Business electricity price - Brazil', 'https://www.globalpetrolprices.com/Brazil/electricity_prices/', 'GlobalPetrolPrices.com', '2026-09-16', 'Source recorded in energy-data.csv');
INSERT INTO metrics (country_id, metric_name, value, unit, period, evidence_type, source_id, notes) VALUES ((SELECT id FROM countries WHERE name='Brazil'), 'business_electricity_price', 0.158, 'USD/kWh', '2025-12', 'fact', last_insert_rowid(), 'National business electricity price; not a site-specific data center tariff.');

INSERT OR IGNORE INTO countries (name) VALUES ('Germany');
INSERT INTO sources (name, source_url, publisher, retrieved_at, notes) VALUES ('Business electricity price - Germany', 'https://www.globalpetrolprices.com/Germany/electricity_prices/', 'GlobalPetrolPrices.com', '2026-09-16', 'Source recorded in energy-data.csv');
INSERT INTO metrics (country_id, metric_name, value, unit, period, evidence_type, source_id, notes) VALUES ((SELECT id FROM countries WHERE name='Germany'), 'business_electricity_price', 0.266, 'USD/kWh', '2025-12', 'fact', last_insert_rowid(), 'National business electricity price; not a site-specific data center tariff.');

INSERT OR IGNORE INTO countries (name) VALUES ('France');
INSERT INTO sources (name, source_url, publisher, retrieved_at, notes) VALUES ('Business electricity price - France', 'https://www.globalpetrolprices.com/France/electricity_prices/', 'GlobalPetrolPrices.com', '2026-09-16', 'Source recorded in energy-data.csv');
INSERT INTO metrics (country_id, metric_name, value, unit, period, evidence_type, source_id, notes) VALUES ((SELECT id FROM countries WHERE name='France'), 'business_electricity_price', 0.17, 'USD/kWh', '2025-12', 'fact', last_insert_rowid(), 'National business electricity price; not a site-specific data center tariff.');

INSERT OR IGNORE INTO countries (name) VALUES ('Mexico');
INSERT INTO sources (name, source_url, publisher, retrieved_at, notes) VALUES ('Business electricity price - Mexico', 'https://www.globalpetrolprices.com/Mexico/electricity_prices/', 'GlobalPetrolPrices.com', '2026-09-16', 'Source recorded in energy-data.csv');
INSERT INTO metrics (country_id, metric_name, value, unit, period, evidence_type, source_id, notes) VALUES ((SELECT id FROM countries WHERE name='Mexico'), 'business_electricity_price', 0.242, 'USD/kWh', '2025-12', 'fact', last_insert_rowid(), 'National business electricity price; not a site-specific data center tariff.');

INSERT OR IGNORE INTO countries (name) VALUES ('United Kingdom');
INSERT INTO sources (name, source_url, publisher, retrieved_at, notes) VALUES ('Business electricity price - United Kingdom', 'https://www.globalpetrolprices.com/United-Kingdom/electricity_prices/', 'GlobalPetrolPrices.com', '2026-09-16', 'Source recorded in energy-data.csv');
INSERT INTO metrics (country_id, metric_name, value, unit, period, evidence_type, source_id, notes) VALUES ((SELECT id FROM countries WHERE name='United Kingdom'), 'business_electricity_price', 0.451, 'USD/kWh', '2025-12', 'fact', last_insert_rowid(), 'National business electricity price; not a site-specific data center tariff.');

COMMIT;