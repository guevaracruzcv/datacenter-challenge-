CREATE TABLE countries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    iso_code TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    source_url TEXT,
    publisher TEXT,
    retrieved_at TEXT,
    notes TEXT
);

CREATE TABLE metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    country_id INTEGER NOT NULL,
    metric_name TEXT NOT NULL,
    value REAL,
    unit TEXT,
    period TEXT,
    evidence_type TEXT NOT NULL,
    source_id INTEGER,
    notes TEXT,

    FOREIGN KEY (country_id)
        REFERENCES countries(id),

    FOREIGN KEY (source_id)
        REFERENCES sources(id)
);

CREATE TABLE designs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    country_id INTEGER,
    it_load_mw REAL,
    pue REAL,
    facility_load_mw REAL,
    annual_energy_gwh REAL,
    status TEXT DEFAULT 'draft',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (country_id)
        REFERENCES countries(id)
);

CREATE TABLE design_claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    design_id INTEGER NOT NULL,
    claim_type TEXT NOT NULL,
    claim_text TEXT NOT NULL,
    source_id INTEGER,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (design_id)
        REFERENCES designs(id),

    FOREIGN KEY (source_id)
        REFERENCES sources(id)
);

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    authenticated_user_id TEXT NOT NULL UNIQUE,
    email TEXT,
    team_id TEXT,
    role TEXT NOT NULL DEFAULT 'viewer',
    registered_at TEXT DEFAULT CURRENT_TIMESTAMP
);