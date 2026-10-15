-- Prerequisites:
--   0001_initial_schema.sql
--   seed_energy.sql
--   seed_energy_additional.sql
--
-- Missing or ambiguous required evidence prevents insertion.
-- Count every Canadian metric with each required name before validating
-- its value, unit, period, classification and source relationship.
-- An existing design with this name is never overwritten.

BEGIN TRANSACTION;

WITH
required_metrics(metric_name, expected_value, unit, period) AS (
    VALUES
        ('business_electricity_price',          0.115, 'USD/kWh', '2025-12'),
        ('electricity_generation_solar_share',  1.48,  '%',       '2024'),
        ('electricity_generation_wind_share',   7.35,  '%',       '2024'),
        ('electricity_generation_hydro_share', 53.90,  '%',       '2024')
),
resolved_sources AS (
    SELECT
        r.metric_name,
        MIN(s.id) AS source_id
    FROM required_metrics AS r
    JOIN metrics AS m
      ON m.metric_name = r.metric_name
    JOIN countries AS c
      ON c.id = m.country_id
     AND c.name = 'Canada'
    LEFT JOIN sources AS s
      ON s.id = m.source_id
    GROUP BY r.metric_name
    HAVING COUNT(*) = 1
       AND SUM(CASE
           WHEN m.value = r.expected_value
            AND m.unit = r.unit
            AND m.period = r.period
            AND m.evidence_type = 'fact'
            AND s.id IS NOT NULL
           THEN 1 ELSE 0
       END) = 1
)
INSERT INTO designs (
    name,
    country_id,
    it_load_mw,
    pue,
    facility_load_mw,
    annual_energy_gwh,
    status
)
SELECT
    'Canada  provisional initial academic base design',
    c.id,
    20,
    1.25,
    25,
    219,
    'draft'
FROM countries AS c
WHERE c.name = 'Canada'
  AND (SELECT COUNT(*) FROM resolved_sources) = 4
  AND NOT EXISTS (
      SELECT 1
      FROM designs AS d
      WHERE d.name =
          'Canada  provisional initial academic base design'
  );

WITH
required_metrics(metric_name, expected_value, unit, period) AS (
    VALUES
        ('business_electricity_price',          0.115, 'USD/kWh', '2025-12'),
        ('electricity_generation_solar_share',  1.48,  '%',       '2024'),
        ('electricity_generation_wind_share',   7.35,  '%',       '2024'),
        ('electricity_generation_hydro_share', 53.90,  '%',       '2024')
),
resolved_sources AS (
    SELECT
        r.metric_name,
        MIN(s.id) AS source_id
    FROM required_metrics AS r
    JOIN metrics AS m
      ON m.metric_name = r.metric_name
    JOIN countries AS c
      ON c.id = m.country_id
     AND c.name = 'Canada'
    LEFT JOIN sources AS s
      ON s.id = m.source_id
    GROUP BY r.metric_name
    HAVING COUNT(*) = 1
       AND SUM(CASE
           WHEN m.value = r.expected_value
            AND m.unit = r.unit
            AND m.period = r.period
            AND m.evidence_type = 'fact'
            AND s.id IS NOT NULL
           THEN 1 ELSE 0
       END) = 1
),
eligible_design AS (
    SELECT d.id
    FROM designs AS d
    JOIN countries AS c ON c.id = d.country_id
    WHERE d.name =
              'Canada  provisional initial academic base design'
      AND c.name = 'Canada'
      AND d.it_load_mw = 20
      AND d.pue = 1.25
      AND d.facility_load_mw = 25
      AND d.annual_energy_gwh = 219
      AND d.status = 'draft'
      AND (
          SELECT COUNT(*)
          FROM designs
          WHERE name =
              'Canada  provisional initial academic base design'
      ) = 1
      AND (SELECT COUNT(*) FROM resolved_sources) = 4
),
proposed_claims(
    claim_type,
    claim_text,
    source_metric_name,
    notes
) AS (
    VALUES
    (
        'design_decision',
        'Canada is the provisional country-level academic base case only.',
        NULL,
        'Human-approved scope. models/decision_model.md identifies Canada as the balanced shortlist candidate. This does not establish final location feasibility.'
    ),
    (
        'design_decision',
        'Retain the initial academic baseline of 20 MW IT load, PUE 1.25, 25 MW facility load and 219 GWh annual energy.',
        NULL,
        'Human-approved baseline from README.md and models/decision_model.md. No infrastructure configuration is implied.'
    ),
    (
        'assumption',
        'IT load is 20 MW.',
        NULL,
        'Exercise baseline; README.md and models/decision_model.md.'
    ),
    (
        'assumption',
        'PUE is 1.25.',
        NULL,
        'Exercise baseline; README.md and models/decision_model.md. Achievable site performance is not verified.'
    ),
    (
        'assumption',
        'The annual model applies the baseline IT load and PUE for 8760 operating hours.',
        NULL,
        'README.md and models/evidence_model.md. Analytical operating assumption, not observed utilization.'
    ),
    (
        'fact',
        'Canada has a recorded national business electricity price of USD 0.115/kWh for December 2025.',
        'business_electricity_price',
        'GlobalPetrolPrices; retrieved 2026-09-16. Existing country/metric/source relationship. National business benchmark, not a project tariff; CSV business-price basis is 1000000 kWh/year.'
    ),
    (
        'fact',
        'Canada has a recorded solar share of domestic electricity generation of 1.48% for 2024.',
        'electricity_generation_solar_share',
        'OWID/Ember provenance in data/energy-data.csv and database/seed_energy_additional.sql; retrieved 2026-09-16. Not a project supply commitment.'
    ),
    (
        'fact',
        'Canada has a recorded wind share of domestic electricity generation of 7.35% for 2024.',
        'electricity_generation_wind_share',
        'OWID/Ember provenance in data/energy-data.csv and database/seed_energy_additional.sql; retrieved 2026-09-16. Not a project supply commitment.'
    ),
    (
        'fact',
        'Canada has a recorded hydro share of domestic electricity generation of 53.90% for 2024.',
        'electricity_generation_hydro_share',
        'OWID/Ember provenance in data/energy-data.csv and database/seed_energy_additional.sql; retrieved 2026-09-16. Not a project supply commitment.'
    ),
    (
        'calculation',
        'Facility load = 20 MW x 1.25 = 25 MW.',
        NULL,
        'Derived from the IT-load and PUE assumptions; models/evidence_model.md.'
    ),
    (
        'calculation',
        'Annual facility energy = 25 MW x 8760 h = 219000 MWh = 219 GWh.',
        NULL,
        'Derived from baseline load, PUE and operating hours; models/evidence_model.md.'
    ),
    (
        'calculation',
        'Canada solar + wind + hydro generation share = 1.48% + 7.35% + 53.90% = 62.73%.',
        NULL,
        'Inputs: Canada electricity_generation_solar_share, electricity_generation_wind_share and electricity_generation_hydro_share, period 2024. Multiple source relationships; not total low-carbon share or project electricity mix.'
    ),
    (
        'calculation',
        'Indicative annual electricity expenditure = 219000000 kWh x USD 0.115/kWh = USD 25185000.',
        'business_electricity_price',
        'Combines assumed annual energy with the December 2025 national business-price benchmark. Screening calculation only; not an actual project tariff, quotation, forecast or total operating cost.'
    ),
    (
        'unknown',
        'Region, city, parcel, land availability and site conditions remain unknown.',
        NULL,
        'README.md, models/decision_model.md and models/evidence_model.md. Country-level designation only.'
    ),
    (
        'unknown',
        'Grid connection, available site capacity, delivery timing and grid reliability remain unknown.',
        NULL,
        'README.md and models/decision_model.md. The 25 MW facility load is modeled demand, not demonstrated supply capacity.'
    ),
    (
        'unknown',
        'The project electricity tariff and contractual terms remain unknown.',
        NULL,
        'models/decision_model.md and models/evidence_model.md. National business electricity prices do not establish project terms.'
    ),
    (
        'unknown',
        'Fiber connectivity and network redundancy remain unknown.',
        NULL,
        'README.md, models/decision_model.md and models/evidence_model.md.'
    ),
    (
        'unknown',
        'Cooling architecture, site cooling conditions, water availability and water requirements remain unknown.',
        NULL,
        'README.md, models/decision_model.md and models/cooling_evidence.md. No cooling configuration or water source is selected.'
    ),
    (
        'unknown',
        'Backup power requirements, regulatory constraints and achievable engineering performance remain unknown.',
        NULL,
        'README.md, models/decision_model.md and models/evidence_model.md. No backup capacity or verified PUE performance is asserted.'
    )
)
INSERT INTO design_claims (
    design_id,
    claim_type,
    claim_text,
    source_id,
    notes
)
SELECT
    d.id,
    p.claim_type,
    p.claim_text,
    s.source_id,
    p.notes
FROM eligible_design AS d
CROSS JOIN proposed_claims AS p
LEFT JOIN resolved_sources AS s
  ON s.metric_name = p.source_metric_name
WHERE (p.source_metric_name IS NULL OR s.source_id IS NOT NULL)
  AND NOT EXISTS (
      SELECT 1
      FROM design_claims AS existing
      WHERE existing.design_id = d.id
        AND existing.claim_type = p.claim_type
        AND existing.claim_text = p.claim_text
  );

COMMIT;
