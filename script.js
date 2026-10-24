
document.getElementById("validatorForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const overall = document.getElementById("overallResult");
    overall.textContent = "Validating...";
    overall.style.color = "#174a8b";

    try {
        const response = await fetch("/validate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error("Server validation failed.");
        }

        const data = await response.json();

        // EMAIL RESULT AND DFA DIAGRAM
        displayResult("emailResult", data.email);

        drawDfaDiagram(
            "emailDiagram",
            data.email.transitions,
            data.email.valid
        );

        // PASSWORD RESULT AND DFA DIAGRAM
        displayResult("passwordResult", data.password);

        drawDfaDiagram(
            "passwordDiagram",
            data.password.transitions,
            data.password.valid
        );

        // OVERALL VALIDATION RESULT
        overall.textContent = data.overall_valid
            ? "Email and password accepted!"
            : "Validation failed. Please check the results.";

        overall.style.color = data.overall_valid
            ? "green"
            : "red";

    } catch (error) {
        console.error("Validation error:", error);

        overall.textContent =
            "Unable to validate. Please check the Flask server.";

        overall.style.color = "red";
    }
});


// FUNCTION TO DISPLAY VALIDATION RESULT AND TRANSITIONS
function displayResult(elementId, result) {
    const container = document.getElementById(elementId);

    // Clear previous output to prevent repetition
    container.replaceChildren();

    const message = document.createElement("p");
    message.textContent = result.message;
    message.style.color = result.valid ? "green" : "red";
    message.style.fontWeight = "bold";

    container.appendChild(message);

    const heading = document.createElement("h3");
    heading.textContent = "DFA Transitions";

    container.appendChild(heading);

    if (!result.transitions || result.transitions.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "No transitions to display.";
        container.appendChild(empty);
        return;
    }

    result.transitions.forEach(function (transition) {
        const line = document.createElement("div");

        line.className = "transition";

        line.textContent =
            transition.from + " --" +
            transition.symbol + "--> " +
            transition.to;

        container.appendChild(line);
    });
}


// FUNCTION TO DRAW DFA TRANSITION DIAGRAM
function drawDfaDiagram(containerId, transitions, valid) {
    const container = document.getElementById(containerId);

    // Clear the previous diagram
    container.replaceChildren();

    if (!transitions || transitions.length === 0) {
        container.textContent = "No transitions to display.";
        return;
    }

    const ns = "http://www.w3.org/2000/svg";

    const spacing = 110;
    const radius = 23;
    const height = 120;
    const width = (transitions.length + 1) * spacing + 30;

    const svg = document.createElementNS(ns, "svg");

    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", containerId + " DFA transition diagram");

    // CREATE ARROW MARKER
    // Use a unique marker ID for each diagram
    const markerId = containerId + "Arrow";

    const defs = document.createElementNS(ns, "defs");
    const marker = document.createElementNS(ns, "marker");

    marker.setAttribute("id", markerId);
    marker.setAttribute("markerWidth", "8");
    marker.setAttribute("markerHeight", "8");
    marker.setAttribute("refX", "7");
    marker.setAttribute("refY", "3");
    marker.setAttribute("orient", "auto");

    const arrowHead = document.createElementNS(ns, "path");

    arrowHead.setAttribute("d", "M0,0 L0,6 L7,3 z");
    arrowHead.setAttribute("fill", "#174a8b");

    marker.appendChild(arrowHead);
    defs.appendChild(marker);
    svg.appendChild(defs);

    // COLLECT STATES IN TRANSITION ORDER
    const states = [transitions[0].from];

    transitions.forEach(function (transition) {
        if (transition.to !== "q_dead" &&
            transition.to !== "p_dead") {
            states.push(transition.to);
        }
    });

    // Remove duplicate states
    const uniqueStates = [...new Set(states)];

    // SVG ELEMENT CREATION HELPER
    function addSvg(tag, attributes, textContent) {
        const element = document.createElementNS(ns, tag);

        Object.entries(attributes).forEach(function ([key, value]) {
            element.setAttribute(key, value);
        });

        if (textContent !== undefined) {
            element.textContent = textContent;
        }

        svg.appendChild(element);

        return element;
    }

    // START ARROW
    addSvg("line", {
        x1: 4,
        y1: 60,
        x2: 23,
        y2: 60,
        stroke: "#174a8b",
        "stroke-width": 2,
        "marker-end": `url(#${markerId})`
    });

    // DRAW STATES, ARROWS AND SYMBOLS
    uniqueStates.forEach(function (state, index) {
        const x = 50 + index * spacing;
        const y = 60;

        // DRAW ARROW FROM PREVIOUS STATE
        if (index > 0) {
            const transition = transitions[index - 1];
            const previousX = 50 + (index - 1) * spacing;

            addSvg("line", {
                x1: previousX + radius,
                y1: y,
                x2: x - radius - 3,
                y2: y,
                stroke: "#174a8b",
                "stroke-width": 2,
                "marker-end": `url(#${markerId})`
            });

            // CHARACTER LABEL
            addSvg("text", {
                x: (previousX + x) / 2,
                y: y - 15,
                "text-anchor": "middle",
                fill: "#102d50",
                "font-size": 14
            }, transition.symbol);
        }

        const isFinalState =
            valid && index === uniqueStates.length - 1;

        const isStartState = index === 0;

        // STATE CIRCLE
        addSvg("circle", {
            cx: x,
            cy: y,
            r: radius,
            fill: isFinalState || isStartState
                ? "#d9f7df"
                : "#e4edff",
            stroke: isFinalState
                ? "#16803d"
                : "#174a8b",
            "stroke-width": 2
        });

        // DOUBLE CIRCLE FOR ACCEPTING STATE
        if (isFinalState) {
            addSvg("circle", {
                cx: x,
                cy: y,
                r: radius - 5,
                fill: "none",
                stroke: "#16803d",
                "stroke-width": 2
            });
        }

        // STATE NAME
        addSvg("text", {
            x: x,
            y: y + 5,
            "text-anchor": "middle",
            fill: "#102d50",
            "font-size": 12
        }, state);
    });

    // ADD ACCEPTED OR REJECTED STATUS
    const status = document.createElement("p");

    status.textContent = valid
        ? "Accepted: Final state reached."
        : "Rejected: Input does not satisfy the validation rules.";

    status.style.color = valid ? "green" : "red";
    status.style.fontWeight = "bold";

    container.appendChild(svg);
    container.appendChild(status);
}
