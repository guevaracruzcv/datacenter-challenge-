# Evidence Synchronization Contract

## 1. Purpose

Define how curated evidence is synchronized with the persistent D1 database.

The synchronization process must preserve evidence integrity, provenance, unknown values, and reproducibility.

## 2. Source and Persistent State

Current curated source:

`data/energy-data.csv`

Persistent destination:

Cloudflare D1 local database.

The source file and the database are separate states. A change in the source does not automatically change the database.

## 3. Logical Record Identity

For the current business electricity price evidence, the initial logical identity is:

`country + metric_name + period`

Example:

`Indonesia + business_electricity_price + 2025-12`

This identity is used for synchronization logic.

It is not yet enforced as a database UNIQUE constraint because future versions may need to preserve multiple or conflicting evidence sources.

## 4. Synchronization States

### NEW

The logical record does not exist in D1.

Action:

`INSERT`

### UNCHANGED

The logical record exists and the curated evidence has not materially changed.

Action:

`NO-OP`

Do not create another record.

### CHANGED

The logical record exists, but one or more curated evidence fields have changed.

Examples:

- value
- unit
- source URL
- provenance metadata

Action:

Perform a controlled update.

The change must remain traceable and must not silently create a duplicate observation.

### UNKNOWN

The curated source does not contain a valid evidence value.

Action:

Preserve the state as Unknown.

Do not convert missing evidence to zero.

Do not invent a value.

## 5. Synchronization Decision Flow

Source Observation
        |
        v
Does logical record exist?
        |
   +----+----+
   |         |
   NO       YES
   |         |
 INSERT      v
        Has evidence changed?
             |
        +----+----+
        |         |
       NO        YES
        |         |
      NO-OP   CONTROLLED
                UPDATE

If the source value is unavailable:

`UNKNOWN`

## 6. Provenance Rule

A synchronized factual value must retain sufficient provenance to determine:

- source/provider
- source URL
- period
- unit
- retrieval information
- evidence type
- relevant limitations

A value without adequate provenance must not silently become trusted evidence.

## 7. Idempotence Requirement

Running synchronization repeatedly against unchanged source evidence must converge to the same persistent state.

Repeated execution must not create duplicate sources or duplicate metrics merely because the synchronization was run again.

## 8. Current Boundary

This contract currently applies to the initial energy evidence workflow.

It does not yet define:

- conflicting-source reconciliation
- historical versioning
- remote D1 synchronization
- automatic API refresh
- user-generated evidence
- AI-generated updates

These require explicit design before implementation.

## 9. Architectural Principle

Initial load and synchronization are different operations.

Initial load creates persistent state.

Synchronization compares source state with persistent state and decides whether to insert, preserve, update, or classify evidence as unknown.
