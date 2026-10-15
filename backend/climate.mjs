import { HttpError } from "./adviser.mjs";

// Existing reviewed reference locations and period; not proposed facility sites.
export const references = {
  Indonesia: { location: "Jakarta", latitude: -6.221441, longitude: 106.856186 },
  Brazil: { location: "Brasilia", latitude: -15.782073, longitude: -47.88678 },
  Canada: { location: "Ottawa", latitude: 45.448154, longitude: -75.75235 }
};
const fields = [
  ["climate_mean_temperature_c", "mean_temperature_c", "°C"],
  ["climate_min_temperature_c", "min_temperature_c", "°C"],
  ["climate_max_temperature_c", "max_temperature_c", "°C"],
  ["climate_mean_relative_humidity_pct", "mean_relative_humidity_pct", "%"],
  ["climate_observation_count", "observations", "hours"]
];
const limitation = "Reference-location screening using historical reanalysis; not a proposed data center site or site-specific measurement.";

export function summarizeClimate(data, reference) {
  const hourly = data?.hourly;
  const units = data?.hourly_units;
  if (units?.temperature_2m !== "°C" || units?.relative_humidity_2m !== "%" ||
      typeof data.latitude !== "number" || typeof data.longitude !== "number" ||
      Math.abs(data.latitude - reference.latitude) > 1 ||
      Math.abs(data.longitude - reference.longitude) > 1 ||
      !Number.isFinite(data.latitude) || !Number.isFinite(data.longitude) ||
      !Array.isArray(hourly?.time) || !Array.isArray(hourly.temperature_2m) ||
      !Array.isArray(hourly.relative_humidity_2m) ||
      hourly.time.length !== 8760 || hourly.temperature_2m.length !== 8760 ||
      hourly.relative_humidity_2m.length !== 8760) {
    throw new HttpError(502, "InvalidClimateEvidence", "Climate validation failed. Existing valid evidence is retained.");
  }
  const start = Date.UTC(2025, 0, 1);
  for (let i = 0; i < 8760; i++) {
    const temperature = hourly.temperature_2m[i];
    const humidity = hourly.relative_humidity_2m[i];
    if (hourly.time[i] !== new Date(start + i * 3600000).toISOString().slice(0, 16) ||
        typeof temperature !== "number" || !Number.isFinite(temperature) || temperature < -100 || temperature > 70 ||
        typeof humidity !== "number" || !Number.isFinite(humidity) || humidity < 0 || humidity > 100) {
      throw new HttpError(502, "InvalidClimateEvidence", "Climate validation failed. Existing valid evidence is retained.");
    }
  }
  const round = value => Number(value.toFixed(2));
  return {
    mean_temperature_c: round(hourly.temperature_2m.reduce((sum, value) => sum + value, 0) / 8760),
    min_temperature_c: round(Math.min(...hourly.temperature_2m)),
    max_temperature_c: round(Math.max(...hourly.temperature_2m)),
    mean_relative_humidity_pct: round(hourly.relative_humidity_2m.reduce((sum, value) => sum + value, 0) / 8760),
    observations: 8760
  };
}

export async function refreshClimate(env, body) {
  if (Object.keys(body).some(key => key !== "country") || !Object.hasOwn(references, body.country)) {
    throw new HttpError(400, "UnsupportedReference", "Select Indonesia, Brazil or Canada from the existing climate study.");
  }
  const reference = references[body.country];
  const country = await env.DB.prepare("SELECT id FROM countries WHERE name = ?").bind(body.country).first();
  if (!country) {
    throw new HttpError(409, "CountryRequired", "The selected country must already exist in the evidence database.");
  }
  const url = new URL("https://archive-api.open-meteo.com/v1/archive");
  url.search = new URLSearchParams({
    latitude: String(reference.latitude), longitude: String(reference.longitude),
    start_date: "2025-01-01", end_date: "2025-12-31",
    hourly: "temperature_2m,relative_humidity_2m", timezone: "UTC", temperature_unit: "celsius"
  }).toString();
  let data;
  try {
    const response = await fetch(url.href, { redirect: "error", signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error();
    data = await response.json();
  } catch {
    throw new HttpError(503, "ClimateSourceUnavailable", "The climate source is unavailable. Existing valid evidence is retained.");
  }
  const summary = summarizeClimate(data, reference);
  const retrievedAt = new Date().toISOString();
  const notes = JSON.stringify({
    refresh_id: crypto.randomUUID(), reference_location: reference.location,
    request_coordinates: { latitude: reference.latitude, longitude: reference.longitude },
    returned_coordinates: { latitude: data.latitude, longitude: data.longitude },
    period: "2025", limitation
  });
  const sourceName = "Open-Meteo Historical Weather API — " + reference.location;
  const statements = [
    env.DB.prepare(`
      INSERT INTO sources (name, source_url, publisher, retrieved_at, notes)
      VALUES (?, ?, 'Open-Meteo', ?, ?)
    `).bind(sourceName, url.href, retrievedAt, notes),
    ...fields.map(([metric, field, unit]) => env.DB.prepare(`
      INSERT INTO metrics (country_id, metric_name, value, unit, period, evidence_type, source_id, notes)
      SELECT ?, ?, ?, ?, '2025', 'calculation', id, ?
      FROM sources WHERE name = ? AND notes = ?
    `).bind(country.id, metric, summary[field], unit, limitation, sourceName, notes))
  ];
  // D1 batch is transactional: preserve the previous snapshot on any write failure.
  const results = await env.DB.batch(statements);
  if (results.some(result => result.success === false)) {
    throw new HttpError(503, "ClimateSaveUnavailable", "The validated refresh could not be saved.");
  }
  return { country: body.country, reference_location: reference.location, period: "2025",
    ...summary, retrieved_at: retrievedAt, source_url: url.href, limitation };
}

export async function getClimate(env) {
  const result = await env.DB.prepare(`
    SELECT c.name AS country, m.metric_name, m.value, m.source_id,
           s.name AS source_name, s.source_url, s.retrieved_at, s.notes
    FROM metrics m JOIN countries c ON c.id = m.country_id
    JOIN sources s ON s.id = m.source_id
    WHERE m.metric_name IN ('climate_mean_temperature_c', 'climate_min_temperature_c',
      'climate_max_temperature_c', 'climate_mean_relative_humidity_pct', 'climate_observation_count')
      AND m.source_id = (SELECT MAX(m2.source_id) FROM metrics m2
        WHERE m2.country_id = m.country_id AND m2.metric_name = 'climate_observation_count')
    ORDER BY c.name, m.metric_name
  `).all();
  const candidates = new Map();
  for (const row of result.results) {
    if (!candidates.has(row.country)) {
      let notes;
      try { notes = JSON.parse(row.notes); } catch { continue; }
      candidates.set(row.country, {
        country: row.country, reference_location: notes.reference_location,
        period: "2025", source_id: row.source_id, source_url: row.source_url,
        retrieved_at: row.retrieved_at, limitation: notes.limitation
      });
    }
    const field = fields.find(item => item[0] === row.metric_name);
    if (field) candidates.get(row.country)[field[1]] = row.value;
  }
  return { period: "2025", candidates: [...candidates.values()].filter(candidate =>
    fields.every(([, field]) => typeof candidate[field] === "number" && Number.isFinite(candidate[field]))) };
}
