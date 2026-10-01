# AI Data Center Decision Platform



## 1. Project Purpose



This project develops an evidence-based decision platform for the initial design of a 25 MW AI data center.



The platform will support analysis of three strategic alternatives:



\- Build

\- Lease

\- Hybrid



The system will progressively integrate energy data, engineering assumptions, external evidence, persistent data, user authentication, and an AI adviser.



## 2. Initial Data Source



The first dataset is:



`data/energy-data.csv`



Current dataset structure:



\- 15 countries

\- 49 fields

\- Electricity prices

\- Electricity generation mix

\- Primary energy mix

\- Energy production and trade

\- Source URLs

\- Retrieval dates

\- Notes and definitions



## 3. Initial Decision Dimensions



The current dataset supports four initial evidence dimensions:



1\. Energy Cost

2\. Energy Mix

3\. Energy Security and Trade

4\. Evidence Provenance



These dimensions do not yet constitute the complete data-center location model.



## 4. Known Missing Evidence



Additional evidence will be required for:



\- Grid capacity and reliability

\- Specific site/location

\- Network and fiber connectivity

\- Cooling strategy

\- Water availability and requirements

\- Backup power

\- Land/site conditions

\- Regulatory constraints

\- Engineering assumptions and uncertainties



Missing information must remain explicitly identified as unknown until supported by evidence.



## 5. Baseline Data Center Parameters



Initial design assumptions:



\- IT Load: 20 MW

\- PUE: 1.25

\- Facility Load: 25 MW

\- Operating Hours: 8,760 hours/year

\- Annual Facility Electricity Requirement: 219 GWh/year



## 6. Evidence Model



Information used by the platform must be classified as:



\- Fact

\- Assumption

\- Calculation

\- Design Decision

\- Unknown



The AI adviser must not become the source of truth. It must reason over controlled evidence and clearly distinguish evidence from assumptions and calculations.



## 7. Development Architecture



The project will evolve through the following architecture:



Data

→ Evidence Model

→ Website

→ Persistent Database

→ External APIs

→ Authentication and Authorization

→ AI Adviser



## 8. Current Status



Completed:



\- Created project directory

\- Created `data/` directory

\- Copied `energy-data.csv`

\- Verified 15 countries

\- Verified 49 fields

\- Created project README



Next:



\- Define the initial evidence model

\- Define the three-country screening method

\- Create the first website structure

