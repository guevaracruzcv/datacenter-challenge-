# Evidence Model



## 1. Purpose



This document defines how information is interpreted and used by the

AI Data Center Decision Platform.



The objective is to prevent raw data, assumptions, calculations,

design decisions, and unknown information from being treated as

equivalent evidence.



## 2. Evidence Classification



Every relevant claim used by the platform should be classified as one

of the following:



### Fact



Information obtained from an identified source.



Example:

Business electricity price reported for a country.



A fact must retain its source, period, unit, and relevant limitations.



### Assumption



A value or condition adopted for analysis but not established as an

observed fact.



Example:

The data center operates 8,760 hours per year.



### Calculation



A value derived deterministically from facts or assumptions.



Example:



Facility Load = IT Load × PUE



20 MW × 1.25 = 25 MW



Annual Electricity Requirement:



25 MW × 8,760 hours = 219,000 MWh = 219 GWh/year



### Design Decision



A choice made by the project team based on available evidence,

constraints, and assumptions.



Examples:



\- Selected country

\- Cooling architecture

\- Grid connection strategy

\- Backup power strategy

\- Build, Lease, or Hybrid approach



### Unknown



Information required for the decision but not yet supported by

sufficient evidence.



Examples:



\- Available grid capacity at the selected site

\- Actual electricity tariff available to the project

\- Fiber redundancy at the proposed location

\- Water availability

\- Site-specific reliability



Unknown information must not be silently converted into an assumption

or fact by the AI adviser.



## 3. Initial Energy Evidence



The current dataset is:



`../data/energy-data.csv`



It contains 15 countries and 49 fields.



The initial evidence can support analysis in four broad dimensions:



### Energy Cost



Primary field:



`business\_price\_usd\_per\_kwh`



Decision relevance:



Provides an initial indicator of electricity operating cost.



Limitation:



A national business electricity price does not establish the tariff

that would actually be available to a 25 MW AI data center.



### Energy Mix



Relevant fields include electricity generation shares for:



\- Solar

\- Wind

\- Oil and other fossil fuels

\- Gas

\- Coal

\- Hydro

\- Other sources



Decision relevance:



Provides evidence about the composition of electricity generation.



### Energy Security and Trade



Relevant fields include:



\- Domestic generation

\- Gross imports

\- Gross exports

\- Net imports



Decision relevance:



Provides context about the scale and cross-border position of the

energy system.



These indicators do not by themselves establish site-level grid

reliability or available capacity.



### Evidence Provenance



Relevant fields include:



\- Source URLs

\- Source definitions

\- Data periods

\- Accessed dates

\- Notes



Decision relevance:



Allows users and the future AI adviser to identify where evidence

originated and understand important limitations.



## 4. Evidence Rule



The platform should follow this principle:



Raw Data

→ Evidence

→ Analysis

→ Decision



The AI adviser may interpret and explain evidence, but it must not

become the source of truth.



When evidence is unavailable, the system should report the information

as unknown rather than inventing a value.
## Evidence Gap and Source Strategy

After the initial energy screening, the three candidate countries require
additional evidence before a location or Build / Lease / Hybrid decision
can be supported.

| Evidence Area | Current Status | Preferred Source Strategy |
|---|---|---|
| Business electricity price | Available | Existing curated dataset |
| Electricity generation mix | Available | Existing curated dataset |
| Electricity production and trade | Available | Existing curated dataset |
| Grid capacity at proposed site | Unknown | Curated authoritative evidence |
| Grid reliability | Unknown | Authoritative external source / API if available |
| Site-specific electricity tariff | Unknown | Utility or project-specific evidence |
| Fiber connectivity and redundancy | Unknown | Curated authoritative evidence |
| Cooling conditions | Unknown | External climate data / API |
| Water availability | Unknown | Authoritative external evidence |
| Land / site availability | Unknown | Project-specific evidence |
| Regulatory constraints | Unknown | Curated official sources |
| Engineering uncertainties | Unknown | Explicit project assumptions / engineering evidence |

### Source Hierarchy

The platform should prefer evidence in the following order:

1. Project-specific and authoritative evidence
2. Curated official or institutional sources
3. Validated external APIs
4. Explicit assumptions when evidence is not yet available
5. Unknown when neither evidence nor an authorized assumption exists

The AI adviser must not convert missing evidence into facts.

### Current Boundary

The current energy dataset supports initial country screening only.

Indonesia, Brazil, and Canada are candidates for deeper investigation,
not final location recommendations.

Additional evidence must be collected and validated before detailed
country comparison and Build / Lease / Hybrid analysis.

