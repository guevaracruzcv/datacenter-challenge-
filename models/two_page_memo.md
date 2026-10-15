# Academic Decision Memo

To: University Consortium  
From: Academic Project Team  
Subject: Initial AI data-center baseline, sensitivity and decision limits  
Date: October 15, 2026

## Decision Context

The consortium is evaluating an initial approximately 25 MW AI data-center facility concept and considering Build, Lease and Hybrid arrangements. This memo assesses the evidence, assumptions, uncertainty and risk already documented in the repository. Its purpose is to support an academic decision discussion, not to make the project appear attractive or imply that implementation is justified.

The [evidence model](evidence_model.md) distinguishes **fact**, **assumption**, **calculation**, **design_decision** and **unknown**. Source-attributed national energy observations are facts within their recorded periods and limitations. Adopted analytical inputs are assumptions; arithmetic results are calculations; choices such as the provisional country are design decisions. Missing decision-critical information remains unknown.

## Evidence-Based Base Case

**Canada is the provisional country-level academic base case**, a `design_decision` retained in draft form. It is not proof of site feasibility. The reproducible [base-design seed](../database/seed_base_design.sql) provides the baseline and classified claims; its availability in the repository does not establish application to hosted D1.

The base inputs are IT load of **20 MW**, PUE of **1.25** and operating hours of **8,760/year**, each an `assumption`. Facility load is a `calculation`: 20 MW multiplied by 1.25 gives **25 MW**. Annual facility electricity is also a `calculation`: 25 MW multiplied by 8,760 hours gives **219 GWh/year**. These are modeled requirements, not measured performance or available supply capacity.

The existing [three-country screening](decision_model.md) identifies Indonesia as cost-oriented, Brazil as generation-mix-oriented and Canada as balanced. Indonesia has the lowest documented business electricity price; Brazil has the highest calculated solar-plus-wind-plus-hydro generation share. Canada is the balanced candidate under the documented cost/mix screening assumption and shortlist-diversity rule. This supports a provisional academic starting point, not a complete location ranking. National electricity prices do not establish a project tariff, and generation shares and trade positions do not establish site-level grid capacity or reliability.

No region, city or parcel is selected. Jakarta, Brasília and Ottawa are climate reference locations only, not proposed data-center sites. Their observations remain separate climate evidence and cannot establish the selected project's cooling conditions or achievable PUE, as explained in the [cooling evidence model](cooling_evidence.md).

## Stress-Test Results

The two approved [academic stress cases](academic_scenarios.md) use **student-defined academic assumptions**, not forecasts, measured values, engineering limits or professor-provided values. They change one input at a time and are evaluated separately against the base. Operating hours remain 8,760/year.

| Case | IT load | PUE | Facility load | Annual energy |
| --- | --- | --- | --- | --- |
| Base | 20 MW | 1.25 | 25 MW | 219 GWh |
| Efficiency degradation | 20 MW | 1.50 | 30 MW | 262.8 GWh |
| IT demand growth | 25 MW | 1.25 | 31.25 MW | 273.75 GWh |

Stress Case 1 isolates lower energy efficiency: changing PUE to 1.50 increases facility load and annual energy by **20%**. Stress Case 2 isolates a **25%** increase in IT demand: changing IT load to 25 MW at unchanged PUE increases facility load and annual energy by **25%**. The results show material sensitivity to both inputs. They do not demonstrate capacity availability, predict operational deterioration or establish an engineering response.

## Build / Lease / Hybrid Assessment

Under the [existing comparison](build_lease_hybrid_comparison.md), Build means developing and operating the required infrastructure; Lease means using external operator capacity; Hybrid combines owned infrastructure and external capacity. All three must address the same IT requirement, but no particular facility, operator offering or Hybrid allocation has been established.

The current evidence is insufficient to select Build, Lease or Hybrid as the preferred alternative without introducing unsupported assumptions. Retain all three. The repository supports comparing their capacity and operating arrangements qualitatively, but not asserting that Lease is faster, Build is cheaper over time or Hybrid is more resilient or flexible. CAPEX, lease pricing, financing, total cost and commercial terms remain unknown. A national electricity-price benchmark cannot substitute for those inputs.

## Key Uncertainties

The major `unknown` dimensions are the specific site; grid connection, capacity and reliability; actual project electricity tariff; cooling architecture and achievable PUE; water availability; network redundancy; backup requirements; regulatory feasibility; and Build / Lease / Hybrid commercial terms. The Hybrid owned/external split is also unknown. These gaps prevent the modeled electrical requirement from establishing technical or commercial feasibility.

The [academic architecture](system_architecture.md) follows evidence/database records, deterministic calculations and AI Adviser explanation. [calculateEnergy()](../backend/adviser.mjs) remains authoritative. The AI Adviser may explain evidence and calculations, but must not invent or contradict them. Existing answer validation rejects contradictory simple numerical energy assertions, including displayed uncertainty text. Conflicting screening observations are surfaced explicitly rather than silently resolved by selecting one value. These controls preserve academic evidence integrity; they do not resolve the underlying unknowns.

## Conclusion

The academic model establishes a reproducible baseline and demonstrates material sensitivity to PUE and IT demand. Canada remains a provisional country-level base case only. Major site and commercial unknowns remain, so the current evidence does not justify a final Build / Lease / Hybrid selection. The appropriate academic conclusion is to retain the alternatives and distinguish established evidence from assumptions and unresolved questions.

This memo is not a feasibility study, investment recommendation, engineering design, procurement recommendation, financial model or site-selection report.
