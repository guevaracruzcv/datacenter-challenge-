# Academic Build / Lease / Hybrid Comparison

## 1. Purpose

Compare Build, Lease and Hybrid within the evidence currently available in the project. This assessment identifies supported distinctions, shared requirements and missing evidence. It does not assign numerical advantages or rank alternatives using unsupported assumptions.

## 2. Common Baseline

| Parameter | Baseline | Evidence classification |
| --- | --- | --- |
| IT load | 20 MW | assumption |
| PUE | 1.25 | assumption |
| Facility load | 25 MW | calculation: 20 MW x 1.25 |
| Operating hours | 8,760/year | assumption |
| Annual facility energy | 219 GWh/year | calculation: 25 MW x 8,760 h = 219,000 MWh |
| Country | Canada, provisional country-level academic base case only | design_decision |

The baseline comes from [README.md](../README.md) and [decision_model.md](decision_model.md). The approved Canadian base case is represented in [seed_base_design.sql](../database/seed_base_design.sql) with status `draft`.

These parameters describe the common analytical requirement. They do not establish available capacity, achievable PUE or actual operating performance for any alternative. Region, city, parcel and grid connection remain unknown.

## 3. Definitions

The definitions in [decision_model.md](decision_model.md), Stage 5, are:

- **Build:** Develop and operate the required data-center infrastructure.
- **Lease:** Use capacity provided by an external data-center operator.
- **Hybrid:** Combine owned infrastructure with externally provided capacity.

These definitions describe arrangements, not demonstrated cost, timing or performance advantages.

## 4. Comparison Matrix

| Dimension | Build | Lease | Hybrid |
| --- | --- | --- | --- |
| Capacity arrangement | Developed infrastructure | Capacity provided by an external operator | Combination of owned infrastructure and external capacity |
| Operating arrangement | Develop and operate the infrastructure | Use external operator capacity; the detailed operating-responsibility split is unknown | Owned and external arrangements; the operating-responsibility split is unknown |
| Relationship to the 20 MW IT requirement | Would need to demonstrate that the developed infrastructure meets the requirement | Would need to demonstrate that the external offering meets the requirement | Would need to demonstrate that the combined arrangement meets the requirement; allocation is unknown |
| Evidence currently available | Common baseline, provisional Canadian country context, national energy evidence and documented gaps | Same common evidence; no specific operator offering established | Same common evidence; no owned/external allocation established |
| Evidence still required | Evidence for a specific developed-facility arrangement, including site, power, network, cooling and operating feasibility | Evidence for a specific external offering, including usable capacity, infrastructure suitability, responsibilities and terms | Evidence for both components, their allocation and how they jointly meet the requirement |
| Principal unknowns | Site feasibility, grid availability, costs, delivery timing and achievable engineering performance | Suitable operator capacity, pricing, terms, availability and demonstrated service performance | Owned/external split, suitability of both components, responsibilities, costs and combined performance |

The national energy dataset supports electricity-price, generation-mix and production/trade context. These are country-level indicators; they do not establish site reliability, spare grid capacity or a particular facility's electricity supply.

The Canadian national business electricity price can support an indicative electricity-expenditure calculation. It does not establish a project tariff or lease energy charge. The existing calculation is not a complete cost for any alternative and must not be added to an unspecified lease charge as though the charging arrangement were known.

Climate-reference evidence does not establish a site or distinguish the three alternatives. Jakarta, Brasília and Ottawa are climate reference locations only, not proposed data-center sites. Their statistics remain in the climate evidence layer and are not treated as base-design claims.

## 5. Explicit UNKNOWN Dimensions

| Dimension | Current status and boundary |
| --- | --- |
| CAPEX | UNKNOWN; no supported alternative-specific capital cost |
| Lease pricing | UNKNOWN; no specific operator price or charging basis |
| Total cost | UNKNOWN; no defensible full-cost comparison |
| Financing | UNKNOWN; no supported rates or financing arrangement |
| Project electricity tariff | UNKNOWN; national business-price evidence is not a project tariff |
| Grid connection and capacity | UNKNOWN; modeled facility demand does not demonstrate supply availability or connection feasibility |
| Delivery/construction timing | UNKNOWN; no supported construction schedule or operator delivery commitment |
| Cooling configuration | UNKNOWN; no architecture selected or site-specific engineering basis established |
| Achievable PUE | UNKNOWN; 1.25 remains an analytical assumption |
| Water | UNKNOWN; availability, source and requirements are not established |
| Network redundancy | UNKNOWN; connectivity and redundant routes are not established |
| Backup power | UNKNOWN; configuration, requirements and capacity are not established |
| Contractual terms | UNKNOWN; rights, obligations and operating responsibilities are not established |
| Regulatory feasibility | UNKNOWN; no project-specific feasibility established |
| Hybrid owned/external capacity split | UNKNOWN; no allocation is selected |

Land prices, grid connection costs and detailed engineering costs are also unsupported and remain unknown. No numerical values are assigned to these gaps.

## 6. Evidence Classification

The classifications follow [evidence_model.md](evidence_model.md):

| Classification | Application to this comparison |
| --- | --- |
| fact | Source-attributed national electricity prices, generation shares and production/trade observations, retaining period, units, provenance and limitations. These facts do not establish alternative-specific outcomes. |
| assumption | The analytical IT load of 20 MW, PUE of 1.25 and 8,760 operating hours per year at baseline conditions. They are not verified site performance. |
| calculation | Facility load and annual energy derived deterministically from the baseline. Indicative electricity expenditure may use the recorded national business-price benchmark, with its limitations. |
| design_decision | Canada as a provisional country-level academic base case, retaining draft status. No Build, Lease or Hybrid preference or capacity split is selected. |
| unknown | Unsupported costs, availability, site conditions, contractual arrangements and engineering performance listed above. Missing evidence is not converted into facts or new assumptions. |

## 7. Academic Conclusion

The current evidence is insufficient to select Build, Lease or Hybrid as the preferred alternative without introducing unsupported assumptions.

Retain all three alternatives. The current comparison supports their definitions, structural differences, common baseline and evidence gaps. It does not establish that Lease is faster, Build is cheaper in the long run, or Hybrid is more resilient or flexible.

A preferred alternative would require additional decision-relevant evidence or explicitly authorized exercise assumptions. A concrete Hybrid arrangement would also require an explicit owned/external capacity allocation. The present assessment does not supply those missing inputs.

## 8. Scope Boundary

This is an academic comparison within the current repository evidence and decision framework. It is not:

- a feasibility study;
- a financial investment model;
- a construction plan;
- a procurement recommendation.

This document introduces no stress cases, new numerical assumptions, financial-model complexity or implementation changes.

## 9. Repository Evidence References

- [README.md](../README.md): project purpose, baseline and known missing evidence.
- [decision_model.md](decision_model.md): alternative definitions, decision stages and limits of country screening.
- [evidence_model.md](evidence_model.md): evidence classifications, source hierarchy and explicit unknowns.
- [cooling_evidence.md](cooling_evidence.md): reference-location limitations and need for site-specific cooling analysis.
- [energy-data.csv](../data/energy-data.csv): national energy indicators, source metadata and limitations.
- [seed_energy.sql](../database/seed_energy.sql): national business-price evidence and source relationships.
- [seed_energy_additional.sql](../database/seed_energy_additional.sql): generation-share and energy-context evidence.
- [seed_base_design.sql](../database/seed_base_design.sql): approved provisional Canadian draft baseline, classified claims and unresolved design inputs.
