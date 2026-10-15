# Academic Scenarios

## 1. Purpose

Document the approved base case and two student-defined academic stress cases. Each stress case changes one baseline input to illustrate its deterministic effect on facility load and annual facility electricity requirement.

## 2. Academic Assumption Boundary

The two stress-case parameters are **STUDENT-DEFINED ACADEMIC ASSUMPTIONS**. They are not professor-provided values, forecasts, measured values or engineering limits.

The base assumptions follow [README.md](../README.md) and [decision_model.md](decision_model.md). The stress cases are separately evaluated against that base; they are not combined or applied sequentially. Operating hours remain 8,760/year in all three cases.

Canada remains the provisional country-level academic base case only. This design decision does not select a region, city or site and does not establish site feasibility.

## 3. Base Case

Assumptions:

- IT load = 20 MW.
- PUE = 1.25.
- Operating hours = 8,760/year.

Calculations:

- Facility load = 20 x 1.25 = **25 MW**.
- Annual energy = 25 x 8,760 / 1,000 = **219 GWh/year**.

## 4. Stress Case 1 — Efficiency Degradation

Change:

- PUE = **1.50**, a student-defined academic assumption.

Hold constant:

- IT load = 20 MW.
- Operating hours = 8,760/year.

Calculations:

- Facility load = 20 x 1.50 = **30 MW**.
- Annual energy = 30 x 8,760 / 1,000 = **262.8 GWh/year**.

This case isolates the effect of lower energy efficiency. Facility load and annual energy both increase **20% relative to base**. The change does not establish a cooling configuration or explain an observed efficiency loss.

## 5. Stress Case 2 — IT Demand Growth

Change:

- IT load = **25 MW**, a student-defined academic assumption.

Hold constant:

- PUE = 1.25.
- Operating hours = 8,760/year.

Calculations:

- Facility load = 25 x 1.25 = **31.25 MW**.
- Annual energy = 31.25 x 8,760 / 1,000 = **273.75 GWh/year**.

This case isolates a **25% increase in IT demand**. Facility load and annual energy both increase **25% relative to base**. It does not establish that additional IT or grid capacity is available.

## 6. Scenario Comparison

| Scenario | IT load (MW) | PUE | Operating hours/year | Facility load (MW) | Annual energy (GWh/year) | Facility load and energy change vs. base |
| --- | --- | --- | --- | --- | --- | --- |
| Base case | 20 | 1.25 | 8,760 | 25 | 219 | 0% |
| Stress Case 1: efficiency degradation | 20 | 1.50 | 8,760 | 30 | 262.8 | +20% |
| Stress Case 2: IT demand growth | 25 | 1.25 | 8,760 | 31.25 | 273.75 | +25% |

The comparison describes modeled electricity demand only. Neither stress case changes the provisional geographic decision or resolves the unknowns below.

## 7. Evidence Classification

The classifications follow [evidence_model.md](evidence_model.md).

| Classification | Application |
| --- | --- |
| assumption | IT load, PUE and operating hours, including the student-defined stress parameters of PUE 1.50 and IT load 25 MW. |
| calculation | Facility load, annual energy and percentage changes derived from the stated inputs. |
| design_decision | Canada remains the provisional country-level academic base case. |
| unknown | Site, grid capacity, actual project tariff, cooling architecture, water availability, network redundancy, backup requirements and regulatory feasibility. |

No scenario parameter or calculated result is presented as a measured fact. Existing evidence gaps remain unknown rather than being filled with new assumptions.

## 8. Deterministic Formulas

The existing `calculateEnergy()` function in [backend/adviser.mjs](../backend/adviser.mjs) remains authoritative.

```text
facility_load_mw = it_load_mw * pue

annual_energy_gwh =
facility_load_mw * 8760 / 1000
```

The function uses 8,760 operating hours, matching all three cases. The MW-to-GWh conversion divides annual MWh by 1,000.

Relative change is calculated as `(scenario result / base result - 1) x 100%`: both `30 / 25 - 1` and `262.8 / 219 - 1` equal 20%; both `31.25 / 25 - 1` and `273.75 / 219 - 1` equal 25%.

## 9. Reproducible Validation

Run this Git Bash example from the repository root. It imports the existing function, checks its outputs using Node's built-in assertions and writes no files. It does not access D1 or an external service, duplicate the energy calculation implementation or introduce a test framework.

```bash
node --input-type=module <<'EOF'
import assert from 'node:assert/strict';
import { calculateEnergy } from './backend/adviser.mjs';

const cases = [
  ['Base case', { it_load_mw: 20, pue: 1.25 }, 25, 219],
  ['Stress Case 1', { it_load_mw: 20, pue: 1.50 }, 30, 262.8],
  ['Stress Case 2', { it_load_mw: 25, pue: 1.25 }, 31.25, 273.75]
];

for (const [name, inputs, facility, energy] of cases) {
  const result = calculateEnergy(inputs);
  assert.deepEqual(result, {
    facility_load_mw: facility,
    annual_energy_gwh: energy,
    operating_hours: 8760
  });
  console.log(name + ': PASS', result);
}
EOF
```

## 10. Scope Boundary

These scenarios are NOT:

- feasibility forecasts;
- capacity commitments;
- financial scenarios;
- engineering designs;
- procurement recommendations.

They introduce no CAPEX, tariffs, grid costs, construction schedules or site assumptions. They do not select Build, Lease or Hybrid, change the existing base-design records or establish infrastructure availability. Their purpose is limited to the academic comparison of deterministic energy demand under explicitly stated assumptions.
