\# Cooling Evidence Model



\## 1. Purpose



This document defines the initial climate evidence required to support

the cooling analysis of the proposed 25 MW AI data center.



The objective is not yet to design the cooling system.



The objective is to identify comparable, traceable climate evidence for

the three candidate countries:



\- Indonesia

\- Brazil

\- Canada



\## 2. Decision Question



What climate conditions should be considered when evaluating cooling

requirements for a potential data center location?



\## 3. Initial Climate Variables



The first prototype will investigate:



\### Air Temperature



Purpose:

Provide an initial indication of the thermal conditions affecting

data center cooling requirements.



Status:

External evidence required.



\### Relative Humidity



Purpose:

Provide additional climate context relevant to cooling conditions.



Status:

External evidence required.



\### Location and Data Period



Climate evidence must identify:



\- geographic location represented by the data

\- reporting period

\- measurement unit

\- data source

\- retrieval date



These fields are required for provenance and comparison.



\## 4. Evidence Classification



Climate observations obtained from an identified external source:



Fact



The choice of which climate indicators to use in the prototype:



Design / analytical assumption



Any climate information that has not yet been retrieved or validated:



Unknown



\## 5. Current Boundary



Country-level climate evidence is useful for initial investigation but

does not establish the actual cooling conditions of a specific data

center site.



Site-specific engineering analysis will be required before a final

cooling architecture can be selected.



\## 6. Next Step



Identify an external climate data source or API capable of providing

comparable temperature and humidity evidence for candidate locations.



\## 7. External Source Assessment



\### Candidate Source



Open-Meteo Historical Weather API



\### Required Inputs



\- Latitude

\- Longitude

\- Start date

\- End date

\- Requested climate variables



\### Required Variables



\- temperature\_2m

\- relative\_humidity\_2m



\### Expected Evidence Metadata



\- Geographic coordinates

\- Reporting period

\- Temperature unit

\- Relative humidity unit

\- Source

\- Retrieval date



\### Geographic Representation Gap



The API requires geographic coordinates.



The current screening identifies countries, not specific data center sites.



Therefore, a reference location used for initial climate screening must

be explicitly documented as a screening assumption and must not be

presented as the proposed data center location.



\### Current Decision



Open-Meteo is suitable for the first climate API prototype because it

can provide comparable historical temperature and relative humidity

data for defined geographic coordinates.



The API will not yet be integrated into the application until the

reference locations and reporting period are explicitly defined.



\## 8. Prototype Reference Locations



The first climate prototype requires geographic coordinates.



Because no project-specific data center sites have yet been identified,

the national capitals will be used as reference locations for the

initial API exercise.



This is a screening assumption, not a data center location decision.



| Country | Reference Location | Role |

|---|---|---|

| Indonesia | Jakarta | Screening reference only |

| Brazil | Brasília | Screening reference only |

| Canada | Ottawa | Screening reference only |



The coordinates used in the API request must be recorded together with

the retrieved evidence.



\## 9. Prototype Reporting Period



The initial comparison will use:



Start date: 2025-01-01  

End date: 2025-12-31



The same reporting period must be used for all three reference locations

to maintain comparability.



This period is selected for the prototype and does not establish the

appropriate engineering climate baseline for final data center design.



\## 10. Evidence Contract for the API Request



For each candidate country, the climate evidence record should retain:



\- Country

\- Reference location

\- Latitude

\- Longitude

\- Start date

\- End date

\- Temperature variable

\- Temperature unit

\- Relative humidity variable

\- Relative humidity unit

\- Source

\- Retrieval date

\- Screening limitation



A successful API response is not sufficient by itself.



The response must be validated before the data is accepted as evidence.

