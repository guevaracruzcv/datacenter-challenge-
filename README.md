# AI Data Center Decision Platform

The academic exercise is complete. This repository supports an evidence-based decision for an initial approximately 25 MW AI data-center facility concept, comparing **Build / Lease / Hybrid**.

Academic completeness does not establish site feasibility or verified hosted operation. Hosted Sites, D1, OpenAI API and Open-Meteo execution have not been verified.

## Academic Base Case

| Parameter | Value | Classification |
| --- | --- | --- |
| IT load | 20 MW | assumption |
| PUE | 1.25 | assumption |
| Operating hours | 8,760/year | assumption |
| Facility load | 25 MW | calculation |
| Annual facility energy | 219 GWh/year | calculation |
| Country | Canada, provisional country-level academic base case only | design_decision |

No region, city or parcel is selected. Indonesia, Brazil and Canada form the three-country screening shortlist. Jakarta, Brasilia and Ottawa are climate reference locations only. Current evidence does not establish a final preferred Build / Lease / Hybrid option.

## Evidence and Model

The repository includes the evidence model, country screening, website, database schema and seeds, deterministic calculations, authentication and authorization logic, and an evidence-grounded AI Design Adviser. The [energy dataset](data/energy-data.csv) covers 15 countries and 49 fields, including source URLs, retrieval dates and limitations.

The [evidence model](models/evidence_model.md) distinguishes:

- **fact:** source-attributed observations, retaining periods, units and limitations.
- **assumption:** explicitly adopted analytical inputs.
- **calculation:** results derived deterministically from inputs.
- **design_decision:** a documented project choice.
- **unknown:** information not established by available evidence.

Evidence/database records remain the source of truth. Deterministic energy calculations are authoritative; the AI Adviser explains evidence and calculations. Site conditions, grid capacity and reliability, project tariffs, cooling, water, network redundancy, backup requirements, regulatory feasibility and unsupported commercial costs remain unknown.

## Final Academic Deliverables

- [Two-page memo](models/two_page_memo.md)
- [Five-minute presentation](models/five_minute_presentation.md)
- [Base case and two academic stress cases](models/academic_scenarios.md)
- [Build / Lease / Hybrid comparison](models/build_lease_hybrid_comparison.md)
- [Integrated system architecture](models/system_architecture.md)
- [Reproducible draft base-design seed](database/seed_base_design.sql)

## Local Validation and Hosting Boundary

The existing local test suite uses simulated services and does not demonstrate hosted integration:

```sh
node --test tests/controlled-integration.test.cjs tests/registration-adviser.test.cjs tests/climate-refresh.test.cjs
```

The [academic scenarios](models/academic_scenarios.md) also document reproducible validation using `calculateEnergy()`.

In [hosting.json](.openai/hosting.json), `project_id` is the publication placeholder `REPLACE_WITH_YOUR_SITES_PROJECT_ID`. Replace it with your own Sites project identifier only when separately configuring hosting. The placeholder is not a working project identifier; it is not needed for local academic validation. Repository seeds do not establish population of hosted D1.
