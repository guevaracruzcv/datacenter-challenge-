// ==========================================
// AI Data Center Decision Platform
// app.js - Version 0.2
// ==========================================


// ------------------------------------------
// 1. CSV PARSER
// ------------------------------------------

function parseCSVLine(line) {
    const values = [];
    let currentValue = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const character = line[i];

        if (character === '"') {
            insideQuotes = !insideQuotes;
        } else if (character === "," && !insideQuotes) {
            values.push(currentValue);
            currentValue = "";
        } else {
            currentValue += character;
        }
    }

    values.push(currentValue);

    return values;
}

function isMissing(value) {
    return value === null || value === undefined || value === "";
}

// ------------------------------------------
// 2. APPLICATION INITIALIZATION
// ------------------------------------------

console.log("AI Data Center Decision Platform loaded successfully.");

const statusMessage = document.createElement("p");
statusMessage.textContent = "Decision platform initialized successfully.";
document.querySelector("main").appendChild(statusMessage);


// ------------------------------------------
// 3. LOAD ENERGY DATASET
// ------------------------------------------

fetch("http://127.0.0.1:8787/api/screening/energy")
    .then(response => {
        console.log("Energy API connection status:", response.status);

        if (!response.ok) {
            throw new Error(`Energy API request failed: ${response.status}`);
        }

        return response.json();
    })

    .then(data => {

        console.log("Energy screening data loaded successfully.");

        // ----------------------------------
        // 4. API → STRUCTURED DATA
        // ----------------------------------

        const countries = data.countries;

        console.log("Number of countries:", countries.length);

        // ----------------------------------
        // 5. SCREENING TRANSFORMATION
        // ----------------------------------

       const countriesByBusinessPrice = [...countries]
    .sort((a, b) => {

        const priceA =
            isMissing(a.business_price_usd_per_kwh)
                ? Infinity
                : Number(a.business_price_usd_per_kwh);

        const priceB =
            isMissing(b.business_price_usd_per_kwh)
                ? Infinity
                : Number(b.business_price_usd_per_kwh);

        return priceA - priceB;
    });

// Validate completeness of price data

const countriesWithBusinessPrice =
    countries.filter(country =>
        isMissing(country.business_price_usd_per_kwh)
    );

const countriesWithoutBusinessPrice =
    countries.filter(country =>
        isMissing(country.business_price_usd_per_kwh)
    );

console.log(
    "Total countries retained:",
    countriesByBusinessPrice.length
);

console.log(
    "Countries with business electricity price:",
    countriesWithBusinessPrice.length
);

console.log(
    "Countries without business electricity price:",
    countriesWithoutBusinessPrice.map(
        country => country.country
    )
);
console.log(
    "Countries ordered by business electricity price:",
    countriesByBusinessPrice.map(country => ({
        country: country.country,
        price: country.business_price_usd_per_kwh
    }))
);


        // ----------------------------------
        // 6. DETERMINISTIC CALCULATION
        // ----------------------------------

const annualEnergyKWh = 219_000_000;

countriesByBusinessPrice.forEach(country => {

    // --------------------------------------
    // A. ELECTRICITY COST CALCULATION
    // --------------------------------------

    const hasBusinessPrice =
        isMissing(country.business_price_usd_per_kwh)

    if (hasBusinessPrice) {

        const businessPrice =
            Number(country.business_price_usd_per_kwh);

        country.indicativeAnnualElectricityCost =
            businessPrice * annualEnergyKWh;

    } else {

        country.indicativeAnnualElectricityCost = null;
    }


    // --------------------------------------
    // B. ENERGY MIX CALCULATION
    // --------------------------------------

    const solar =
        isMissing(country.electricity_generation_solar_pct)
            ? null
            : Number(country.electricity_generation_solar_pct);

    const wind =
        isMissing(country.electricity_generation_wind_pct)
            ? null
            : Number(country.electricity_generation_wind_pct);

    const hydro =
        isMissing(country.electricity_generation_hydro_pct)
            ? null
            : Number(country.electricity_generation_hydro_pct);

    if (solar !== null && wind !== null && hydro !== null) {

        country.solarWindHydroShare =
            solar + wind + hydro;

    } else {

        country.solarWindHydroShare = null;
    }

// --------------------------------------
// C. ELECTRICITY TRADE POSITION
// --------------------------------------

const netImports =
    Number(country.electricity_net_imports_twh);

if (netImports > 0) {

    country.electricityTradePosition = "Net Importer";

} else if (netImports < 0) {

    country.electricityTradePosition = "Net Exporter";

} else {

    country.electricityTradePosition = "Balanced / No Net Trade";
}

});

console.log(
    "Solar + Wind + Hydro electricity share:",
    countriesByBusinessPrice.map(country => ({
        country: country.country,
        solar: country.electricity_generation_solar_pct,
        wind: country.electricity_generation_wind_pct,
        hydro: country.electricity_generation_hydro_pct,
        solarWindHydroShare: country.solarWindHydroShare



    }))
);

console.log(
    "Electricity Trade Position:",
    countriesByBusinessPrice.map(country => ({
        country: country.country,
        netImportsTWh: country.electricity_net_imports_twh,
        tradePosition: country.electricityTradePosition
    }))
);

// --------------------------------------
// D. INITIAL THREE-COUNTRY SHORTLIST
// --------------------------------------

const countriesWithPrice =
    countriesByBusinessPrice.filter(
        country => !isMissing(country.business_price_usd_per_kwh)

    );

const prices =
    countriesWithPrice.map(
        country => Number(country.business_price_usd_per_kwh)
    );

const mixes =
    countriesWithPrice.map(
        country => country.solarWindHydroShare
    );

const minPrice = Math.min(...prices);
const maxPrice = Math.max(...prices);

const minMix = Math.min(...mixes);
const maxMix = Math.max(...mixes);

countriesWithPrice.forEach(country => {

    const price =
        Number(country.business_price_usd_per_kwh);

    const normalizedCostScore =
        (maxPrice - price) / (maxPrice - minPrice);

    const normalizedMixScore =
        (country.solarWindHydroShare - minMix) /
        (maxMix - minMix);

    country.balancedScore =
        0.5 * normalizedCostScore +
        0.5 * normalizedMixScore;
});

// --------------------------------------
// SELECT THREE DISTINCT CANDIDATES
// --------------------------------------

const costCandidate =
    countriesWithPrice.reduce((best, country) =>
        Number(country.business_price_usd_per_kwh) <
        Number(best.business_price_usd_per_kwh)
            ? country
            : best
    );

const mixCandidate =
    countriesWithPrice.reduce((best, country) =>
        country.solarWindHydroShare >
        best.solarWindHydroShare
            ? country
            : best
    );

const remainingCountries =
    countriesWithPrice.filter(
        country =>
            country.country !== costCandidate.country &&
            country.country !== mixCandidate.country
    );

const balancedCandidate =
    remainingCountries.reduce((best, country) =>
        country.balancedScore > best.balancedScore
            ? country
            : best
    );

    console.log(
    "Initial Three-Country Shortlist:",
    {
        costOriented: costCandidate.country,
        mixOriented: mixCandidate.country,
        balanced: balancedCandidate.country
    }
);
        // ----------------------------------
        // 7. PRESENTATION
        // ----------------------------------

        const countryDataContainer =
            document.querySelector("#country-data");

        const table = document.createElement("table");

       table.innerHTML = `
    <thead>
        <tr>
            <th>Country</th>
            <th>Business Electricity Price</th>
            <th>Total Energy Consumption</th>
            <th>Solar + Wind + Hydro Share</th>
            <th>Electricity Trade Position</th>
            <th>Indicative Annual Electricity Cost</th>
        </tr>
    </thead>
    <tbody></tbody>
`;

        const tableBody = table.querySelector("tbody");

        countriesByBusinessPrice.forEach(country => {

            const row = document.createElement("tr");

const priceDisplay =
    isMissing(country.business_price_usd_per_kwh)
        ? "Unknown"
        : `$${country.business_price_usd_per_kwh}/kWh`;

const annualCostDisplay =
    country.indicativeAnnualElectricityCost === null
        ? "Unknown"
        : `$${(
            country.indicativeAnnualElectricityCost / 1_000_000
        ).toFixed(2)}M/year`;

const energyMixDisplay =
    country.solarWindHydroShare === null
        ? "Unknown"
        : `${country.solarWindHydroShare.toFixed(2)}%`;

        const netImports =
    Number(country.electricity_net_imports_twh);

let tradePositionDisplay;

if (netImports > 0) {

    tradePositionDisplay =
        `Net Importer (+${netImports.toFixed(2)} TWh)`;

} else if (netImports < 0) {

    tradePositionDisplay =
        `Net Exporter (${netImports.toFixed(2)} TWh)`;

} else {

    tradePositionDisplay =
        `Balanced (0.00 TWh)`;
}

          row.innerHTML = `
    <td>${country.country}</td>
    <td>${priceDisplay}</td>
    <td>${country.total_energy_consumption_exajoules} EJ</td>
    <td>${energyMixDisplay}</td>
    <td>${tradePositionDisplay}</td>
    <td>${annualCostDisplay}</td>
`;

            tableBody.appendChild(row);
        });

        countryDataContainer.appendChild(table);
    

// ----------------------------------
// INITIAL CANDIDATE SHORTLIST
// ----------------------------------

const shortlistContainer =
    document.querySelector("#candidate-shortlist");

const shortlist = [
    {
        profile: "Cost-Oriented",
        country: costCandidate.country,
        reason:
            `Lowest documented business electricity price: $${costCandidate.business_price_usd_per_kwh}/kWh`
    },
    {
        profile: "Generation-Mix-Oriented",
        country: mixCandidate.country,
        reason:
            `Highest Solar + Wind + Hydro Share: ${mixCandidate.solarWindHydroShare.toFixed(2)}%`
    },
    {
        profile: "Balanced",
        country: balancedCandidate.country,
        reason:
            `Highest remaining 50/50 normalized Cost + Mix score: ${balancedCandidate.balancedScore.toFixed(3)}`
    }
];

const shortlistTable =
    document.createElement("table");

shortlistTable.innerHTML = `
    <thead>
        <tr>
            <th>Screening Profile</th>
            <th>Candidate Country</th>
            <th>Selection Basis</th>
        </tr>
    </thead>
    <tbody></tbody>
`;

const shortlistBody =
    shortlistTable.querySelector("tbody");

shortlist.forEach(candidate => {

    const row =
        document.createElement("tr");

    row.innerHTML = `
        <td>${candidate.profile}</td>
        <td>${candidate.country}</td>
        <td>${candidate.reason}</td>
    `;

    shortlistBody.appendChild(row);
});

shortlistContainer.appendChild(shortlistTable);
})
    .catch(error => {
        console.error("Error loading energy dataset:", error);
    });


// Load structured climate evidence
fetch("../data/climate/climate_summary.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("Climate evidence file could not be loaded.");
        }

        return response.json();
    })
    .then(climateData => {

        const container = document.getElementById("climate-data");

        let table = `
            <table>
                <thead>
                    <tr>
                        <th>Country</th>
                        <th>Reference Location</th>
                        <th>Mean Temp. °C</th>
                        <th>Min Temp. °C</th>
                        <th>Max Temp. °C</th>
                        <th>Mean RH %</th>
                        <th>Observations</th>
                    </tr>
                </thead>
                <tbody>
        `;

        climateData.candidates.forEach(candidate => {
            table += `
                <tr>
                    <td>${candidate.country}</td>
                    <td>${candidate.reference_location}</td>
                    <td>${candidate.mean_temperature_c}</td>
                    <td>${candidate.min_temperature_c}</td>
                    <td>${candidate.max_temperature_c}</td>
                    <td>${candidate.mean_relative_humidity_pct}</td>
                    <td>${candidate.observations}</td>
                </tr>
            `;
        });

        table += `
                </tbody>
            </table>
        `;

        container.innerHTML = table;
    })
    .catch(error => {
        console.error("Climate evidence error:", error);
    });

