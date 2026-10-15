# Five-Minute Academic Presentation Outline

Audience: University consortium  
Primary source: [Approved academic decision memo](two_page_memo.md)  
Estimated total speaking time: **5 minutes** (five slides at approximately 60 seconds each, including brief transitions).

## Slide 1 — Initial AI Data-Center Decision

**On-slide bullets**

- Initial approximately 25 MW facility concept.
- Alternatives: Build / Lease / Hybrid.
- Objective: assess evidence, assumptions, uncertainty and risk.

**Recommended visual:** A simple decision question above three equally sized boxes labeled Build, Lease and Hybrid. Show no preferred option.

**Speaker notes:**

The consortium is evaluating an initial AI data-center concept with an approximately 25 MW facility requirement. The question is how the available evidence informs Build, Lease and Hybrid, rather than whether we can make one option appear attractive. This is an academic assessment; implementation is not already justified. We distinguish five classifications: a fact is a source-attributed observation; an assumption is an adopted input; a calculation follows from inputs; a design_decision is a project choice; and an unknown is information not established by evidence. The presentation follows the approved memo: baseline, two controlled stress cases, the alternatives and the limits on any conclusion.

**Estimated speaking time:** 60 seconds.

## Slide 2 — Evidence-Based Base Case

**On-slide bullets**

- Canada: provisional country-level base case (`design_decision`).
- IT load 20 MW; PUE 1.25 (`assumption`).
- Operating hours 8,760/year (`assumption`).
- Facility load 25 MW (`calculation`).
- Annual electricity 219 GWh/year (`calculation`).

**Recommended visual:** Separate assumption inputs from calculated outputs with an arrow. Add a short caption: “Country-level academic decision; site feasibility not established.”

**Speaker notes:**

Canada is a provisional academic design decision, not proof of site feasibility. Existing screening identifies Indonesia as cost-oriented, Brazil as generation-mix-oriented and Canada as balanced. It does not select a region, city or parcel. The base inputs are assumptions: 20 MW IT load, PUE 1.25 and 8,760 operating hours per year. Multiplication gives 25 MW facility load and 219 GWh annual facility electricity. The repository provides a reproducible draft base-design seed with classified claims; that does not establish its application to hosted D1. Evidence/database records feed deterministic calculations and then AI Adviser explanation. calculateEnergy() remains authoritative; the AI must not invent or contradict its results.

**Estimated speaking time:** 60 seconds.

## Slide 3 — Stress Cases

**On-slide bullets**

- Stress parameters are student-defined academic assumptions.
- Stress 1 changes only PUE; facility load and energy rise 20%.
- Stress 2 changes only IT load; facility load and energy rise 25%.

**Recommended visual:** Use this compact comparison table, with only each changed input emphasized. Operating hours stay at 8,760/year in all cases.

| Case | IT load (MW) | PUE | Facility load (MW) | Annual electricity (GWh/year) | Change vs. base |
| --- | --- | --- | --- | --- | --- |
| Base | 20 | 1.25 | 25 | 219 | — |
| Stress 1: efficiency degradation | 20 | **1.50** | 30 | 262.8 | +20% |
| Stress 2: IT demand growth | **25** | 1.25 | 31.25 | 273.75 | +25% |

**Speaker notes:**

These are student-defined academic assumptions, not forecasts, measured values, engineering limits or professor-provided values. Each case changes one input and is compared separately with the base. In Stress Case 1, PUE rises from 1.25 to 1.50 while IT load stays at 20 MW. Facility load becomes 30 MW and annual electricity 262.8 GWh, both 20% above base. In Stress Case 2, IT demand increases 25% to 25 MW while PUE stays at 1.25. Facility load becomes 31.25 MW and annual electricity 273.75 GWh, both 25% above base. These calculations demonstrate sensitivity; they do not establish that the additional capacity is available. The cases are not combined.

**Estimated speaking time:** 60 seconds.

## Slide 4 — Build / Lease / Hybrid

**On-slide bullets**

- Build: develop and operate owned infrastructure.
- Lease: use external operator capacity.
- Hybrid: combine owned and external capacity.
- Unknown: site, grid capacity/reliability, tariff and cooling.
- Unknown: network/backup, regulatory feasibility and commercial terms.

**Recommended visual:** Three equal columns for the arrangements above a shared band of unknowns. Do not use scores, rankings, prices or delivery timelines.

**Speaker notes:**

Build develops and operates infrastructure; Lease uses an external operator's capacity; Hybrid combines owned and external capacity. All address the same IT requirement, but no specific facility, operator offering or Hybrid capacity split has been established. The important unknowns include the specific site, grid capacity and reliability, actual project electricity tariff, cooling architecture, water availability, network redundancy, backup requirements, regulatory feasibility and commercial terms. CAPEX, lease rates, financing and construction timing are not established. National electricity-price evidence cannot substitute for these inputs. We therefore cannot claim Lease is faster, Build is cheaper over time or Hybrid is more resilient or flexible. The comparison supports structural distinctions, not a preferred alternative.

**Estimated speaking time:** 60 seconds.

## Slide 5 — Academic Conclusion

**On-slide bullets**

- A reproducible baseline has been established.
- PUE and IT demand materially affect electricity requirements.
- Canada remains a provisional country-level base case only.
- Major site and commercial unknowns remain.
- Evidence is insufficient to select Build / Lease / Hybrid without unsupported assumptions.

**Recommended visual:** A small evidence-to-calculation-to-explanation flow ending at the conclusion “Retain all three alternatives.” Place the closing takeaway below it.

**Speaker notes:**

The baseline is reproducible, and the stress cases show material sensitivity to PUE and IT demand. Canada remains a provisional country-level academic base case only. Major site and commercial unknowns prevent a final selection, so retain all three alternatives. Conflicting screening evidence is surfaced rather than silently resolved; deterministic calculations remain authoritative. Those controls preserve evidence discipline, not proof of feasibility. This presentation is not a feasibility study, investment recommendation, engineering design, procurement recommendation, financial model or site-selection report. The final takeaway is: “The model supports disciplined decision-making by separating what we know, what we assume, what we calculate, and what remains unknown.”

**Estimated speaking time:** 60 seconds.
