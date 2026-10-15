(async function () {
    const status = document.getElementById("account-status");
    const signIn = document.getElementById("chatgpt-sign-in");
    const register = document.getElementById("register-button");
    const form = document.getElementById("adviser-form");
    const designSelect = document.getElementById("adviser-design");
    const question = document.getElementById("adviser-question");
    const send = document.getElementById("adviser-send");
    const output = document.getElementById("adviser-answer");
    const usage = document.getElementById("adviser-usage");
    const refreshControls = document.getElementById("climate-refresh-controls");
    const refreshCountry = document.getElementById("climate-country");
    const refreshButton = document.getElementById("climate-refresh-button");
    const refreshStatus = document.getElementById("climate-refresh-status");
    const climateOutput = document.getElementById("climate-refresh-data");
    let account = null;
    let reportedTokens = 0;

    async function api(path, body) {
        const response = await fetch(path, body === undefined ? {} : {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "The request could not be completed.");
        return result;
    }

    function updateControls() {
        signIn.hidden = Boolean(account?.authenticated);
        register.hidden = !account?.authenticated || Boolean(account?.registered);
        register.disabled = !account?.authenticated;
        send.disabled = !account?.can_use_adviser || designSelect.options.length === 0;
        question.disabled = send.disabled;
        const canRefresh = ["editor", "team_admin"].includes(account?.role);
        refreshControls.hidden = !canRefresh;
        refreshButton.disabled = !canRefresh;
        status.textContent = !account?.authenticated ? "Sign in with ChatGPT to register and use the Adviser."
            : !account.registered ? "You are signed in. Register to use the Adviser."
            : account.can_use_adviser ? "Registered. Select a saved design and ask a question."
            : "Your application role does not permit Adviser access. Contact the course team.";
    }

    function paragraph(parent, text) {
        const item = document.createElement("p");
        item.textContent = text;
        parent.appendChild(item);
    }

    async function loadSavedClimate() {
        const result = await api("/api/evidence/climate");
        climateOutput.replaceChildren();
        for (const candidate of result.candidates) {
            paragraph(climateOutput, candidate.country + " — " + candidate.reference_location +
                " (" + candidate.period + "): mean temperature " + candidate.mean_temperature_c +
                " °C; minimum " + candidate.min_temperature_c + " °C; maximum " + candidate.max_temperature_c +
                " °C; mean relative humidity " + candidate.mean_relative_humidity_pct + "%; " +
                candidate.observations + " hourly records. Retrieved " + candidate.retrieved_at + ".");
            const link = document.createElement("a");
            try {
                const url = new URL(candidate.source_url);
                if (url.protocol === "https:" && url.hostname === "archive-api.open-meteo.com") {
                    link.href = url.href;
                    link.textContent = "Open-Meteo source [S" + candidate.source_id + "]";
                    link.target = "_blank";
                    link.rel = "noopener noreferrer";
                    climateOutput.appendChild(link);
                }
            } catch {}
            paragraph(climateOutput, candidate.limitation);
        }
        if (result.candidates.length === 0) paragraph(climateOutput, "No saved refresh yet. The initial climate evidence above remains available.");
    }

    refreshButton.addEventListener("click", async function () {
        refreshButton.disabled = true;
        refreshStatus.textContent = "Validating the existing 2025 climate reference…";
        try {
            await api("/api/evidence/climate/refresh", { country: refreshCountry.value });
            await loadSavedClimate();
            refreshStatus.textContent = "Validated evidence saved. Source and retrieval time are shown below.";
        } catch (error) {
            refreshStatus.textContent = error.message + " Existing evidence remains available.";
        } finally {
            updateControls();
        }
    });

    loadSavedClimate().catch(() => {
        refreshStatus.textContent = "Saved refreshes are unavailable. The initial climate evidence above remains available.";
    });

    function renderAnswer(result) {
        output.replaceChildren();
        for (const statement of result.statements) {
            const citations = statement.source_ids.map(id => "[S" + id + "]").join(" ");
            paragraph(output, statement.kind.replaceAll("_", " ") + ": " + statement.text + (citations ? " " + citations : ""));
        }
        for (const text of result.uncertainty) paragraph(output, "Uncertainty: " + text);
        for (const source of result.sources) {
            const row = document.createElement("p");
            row.textContent = "[S" + source.id + "] " + source.name + " — " + (source.publisher || "Publisher unknown") +
                "; retrieved " + (source.retrieved_at || "Unknown") + ". ";
            if (source.url) {
                try {
                    const url = new URL(source.url);
                    if (["http:", "https:"].includes(url.protocol)) {
                        const link = document.createElement("a");
                        link.href = url.href;
                        link.textContent = "Source";
                        link.target = "_blank";
                        link.rel = "noopener noreferrer";
                        row.appendChild(link);
                    }
                } catch {
                    // Keep the source record visible if its URL is invalid.
                }
            }
            output.appendChild(row);
        }
        paragraph(output, result.limitation);
        if (result.usage) {
            reportedTokens += result.usage.total_tokens;
            usage.textContent = "Last answer: " + result.usage.input_tokens + " input + " +
                result.usage.output_tokens + " output = " + result.usage.total_tokens +
                " tokens. Reported tokens on this page: " + reportedTokens + ".";
        } else {
            usage.textContent = "Token usage was not reported for this answer.";
        }
    }

    register.addEventListener("click", async function () {
        register.disabled = true;
        try {
            account = await api("/api/account/register", {});
            updateControls();
        } catch (error) {
            status.textContent = error.message;
            register.disabled = false;
        }
    });

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        send.disabled = true;
        output.replaceChildren();
        paragraph(output, "Consulting the saved design and evidence…");
        try {
            renderAnswer(await api("/api/ai/adviser", {
                design_id: Number(designSelect.value), question: question.value
            }));
        } catch (error) {
            output.replaceChildren();
            paragraph(output, error.message);
        } finally {
            updateControls();
        }
    });

    try {
        const [currentAccount, result] = await Promise.all([api("/api/account"), api("/api/designs")]);
        account = currentAccount;
        for (const design of result.designs) {
            const option = document.createElement("option");
            option.value = String(design.id);
            option.textContent = design.name + " — " + (design.country || "Country unknown") +
                "; PUE " + (design.pue == null ? "Unknown" : design.pue);
            designSelect.appendChild(option);
        }
        updateControls();
        if (result.designs.length === 0) paragraph(output, "No saved initial design is available yet.");
    } catch (error) {
        status.textContent = error.message;
        register.disabled = true;
        send.disabled = true;
        question.disabled = true;
    }
}());
