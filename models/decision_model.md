# Decision Model

## 1. Purpose



This document defines how evidence will be used to support decisions

for the initial design of a 25 MW AI data center.



The decision process must distinguish between:



\- Initial country screening

\- Detailed country comparison

\- Data center design decisions

\- Build, Lease, or Hybrid alternatives



The system should support human decision-making rather than automatically

selecting a country or architecture.



## 2. Decision Process



The initial decision process is:



15 Countries

→ Energy Screening

→ 3 Candidate Countries

→ Additional Evidence

→ Detailed Comparison

→ Data Center Design

→ Build / Lease / Hybrid Analysis



## 3. Stage 1 — Initial Country Screening



The existing energy dataset will be used for preliminary screening.



### Energy Cost



Primary indicator:



`business\_price\_usd\_per\_kwh`



Purpose:



Estimate the relative electricity-cost environment.



Limitation:



The national business electricity price is not necessarily the tariff

available to a specific 25 MW data center.



### Electricity Generation Mix



Indicators include:



\- Solar

\- Wind

\- Hydro

\- Gas

\- Coal

\- Oil and other fossil sources

\- Other generation



Purpose:



Understand the electricity-generation profile of each country.



### Energy System Scale



Indicators include:



\- Total energy consumption

\- Domestic electricity generation



Purpose:



Provide context about the scale of the national energy system.



### Energy Production and Trade



Indicators include:



\- Domestic production

\- Gross imports

\- Gross exports

\- Net imports



Purpose:



Provide evidence about the country's broader energy and electricity

trade position.



## 4. Stage 2 — Candidate Country Shortlist



The initial screening will identify three countries for deeper analysis.



Selection of the three countries must be transparent.



The system must retain:



\- Metrics used

\- Data period

\- Sources

\- Assumptions

\- Missing information

\- Reason for inclusion in the shortlist



No country should be selected solely because it has the lowest

electricity price.



## 5. Stage 3 — Additional Evidence



The three candidate countries require additional evidence that is not

currently available in the energy dataset.



Required areas include:



\- Grid capacity

\- Grid reliability

\- Site-specific electricity availability

\- Actual project electricity tariff

\- Fiber and network connectivity

\- Network redundancy

\- Cooling options

\- Water availability

\- Backup power requirements

\- Land and site conditions

\- Regulatory constraints

\- Relevant engineering uncertainties



Until supported by evidence, these variables must remain classified

as Unknown.



## 6. Stage 4 — Data Center Design



Baseline parameters:



\- IT Load: 20 MW

\- PUE: 1.25

\- Facility Load: 25 MW

\- Operating Time: 8,760 hours/year

\- Annual Electricity Requirement: 219 GWh/year



The platform should use deterministic calculations for engineering

quantities whenever possible.



## 7. Stage 5 — Strategic Alternatives



The platform will support comparison of:



### Build



Develop and operate the required data center infrastructure.



### Lease



Use capacity provided by an external data center operator.



### Hybrid



Combine owned infrastructure with externally provided capacity.



The final comparison requires evidence beyond the current energy

dataset.



## 8. Decision Rule



The platform must not convert incomplete evidence into false precision.



A decision should be traceable through:



Evidence

→ Assumptions

→ Calculations

→ Comparison

→ Design Decision



Unknowns must remain visible.



The AI adviser may explain evidence, identify gaps, and support

comparison, but it must not invent missing evidence.


## 6. Initial Country Screening Criteria

The initial screening uses only evidence currently available in the project dataset.

The screening is intended to reduce the initial set of 15 countries to a smaller candidate set for deeper analysis. It does not determine the final data center location.

| Criterion | Available in Current Dataset | Initial Role |
|---|---|---|
| Business Electricity Price | Yes | Screening |
| Electricity Generation Mix | Yes | Screening |
| Total Energy Consumption | Yes | Context |
| Domestic Electricity Generation | Yes | Context |
| Electricity Imports / Exports | Yes | Context |
| Grid Capacity at Proposed Site | No | Unknown |
| Grid Reliability | No | Unknown |
| Site-Specific Electricity Tariff | No | Unknown |
| Fiber Connectivity and Redundancy | No | Unknown |
| Cooling Conditions | No | Unknown |
| Water Availability | No | Unknown |
| Land / Site Availability | No | Unknown |
| Regulatory Constraints | No | Unknown |

### Screening Rules

1. Use only documented fields from the current dataset.
2. Do not treat the lowest electricity price as sufficient evidence for selecting a country.
3. Do not invent values for unavailable criteria.
4. Missing decision-critical evidence must remain explicitly classified as Unknown.
5. Retain the source period, units, provenance and limitations of the evidence.
6. Initial screening identifies candidates for further investigation; it does not constitute a final location recommendation.
7. Any future weighting or scoring method must be explicitly defined and documented before implementation.

### Current Decision Boundary

The current dataset can support an initial energy-based country screening.

It cannot yet support a complete data center location decision.

Additional evidence is required before evaluating site feasibility and the Build / Lease / Hybrid decision.

## Initial Three-Country Shortlist Rule

The initial shortlist is designed to identify three distinct countries
for deeper investigation. It is a screening mechanism, not a final
recommendation.

### Candidate 1 — Cost-Oriented
Select the country with the lowest documented business electricity price.

### Candidate 2 — Generation-Mix-Oriented
Select the country with the highest calculated Solar + Wind + Hydro Share.

### Candidate 3 — Balanced
Calculate a normalized score using:

- 50% normalized business electricity price score
- 50% normalized Solar + Wind + Hydro Share score

The 50/50 weighting is an explicit screening assumption.

To preserve diversity in the shortlist, countries already selected as
Cost-Oriented or Generation-Mix-Oriented are excluded before selecting
the Balanced candidate.

### Current Result

- Indonesia — Cost-Oriented
- Brazil — Generation-Mix-Oriented
- Canada — Balanced

### Important Limitations

This shortlist is based only on the evidence currently available in the
energy dataset.

It does not yet incorporate:

- site-specific grid capacity
- grid reliability
- negotiated electricity tariffs
- fiber connectivity and redundancy
- cooling conditions
- water availability
- land/site availability
- regulatory constraints
- engineering uncertainties

The shortlist therefore identifies candidates for further investigation,
not the final preferred location.
