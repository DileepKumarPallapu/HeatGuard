(() => {
  const $ = (id) => document.getElementById(id);
  const state = {
    running: false, timer: null, temperature: 31.8, peak: 31.8,
    alertCount: 0, previousState: "normal", ticks: 0,
    history: [], events: [], lastEventState: "normal"
  };
  const initialTemp = 31.8;
  const colors = { normal: "#198a67", caution: "#bd7b13", warning: "#cf4b4b" };

  const chartCtx = $("tempChart").getContext("2d");
  const gradient = chartCtx.createLinearGradient(0, 0, 0, 260);
  gradient.addColorStop(0, "rgba(53,109,230,.19)");
  gradient.addColorStop(1, "rgba(53,109,230,0)");
  const chart = new Chart(chartCtx, {
    type: "line",
    data: {
      labels: ["Now"],
      datasets: [
        { label: "Simulated temperature", data: [initialTemp], borderColor: "#356de6", backgroundColor: gradient, fill: true, tension: .34, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 4 },
        { label: "Caution threshold", data: [55], borderColor: "#dca43b", borderDash: [5,5], borderWidth: 1.4, pointRadius: 0, fill: false },
        { label: "Warning threshold", data: [70], borderColor: "#cf4b4b", borderDash: [4,4], borderWidth: 1.4, pointRadius: 0, fill: false }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false, animation: { duration: 220 },
      interaction: { intersect: false, mode: "index" },
      plugins: { legend: { display: false }, tooltip: { backgroundColor: "#17283e", padding: 10, titleFont: { family: "DM Sans", size: 10 }, bodyFont: { family: "DM Sans", size: 10 }, callbacks: { label: (ctx) => `${ctx.dataset.label}: ${Number(ctx.parsed.y).toFixed(1)}°C` } } },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#9aa4b1", maxTicksLimit: 7, font: { family: "DM Sans", size: 9 } }, border: { display: false } },
        y: { min: 20, max: 100, grid: { color: "#edf0f4" }, ticks: { stepSize: 20, color: "#9aa4b1", font: { family: "DM Sans", size: 9 }, callback: (v) => `${v}°` }, border: { display: false } }
      }
    }
  });

  function thresholds() {
    let caution = Number($("cautionThreshold").value);
    let warning = Number($("warningThreshold").value);
    if (warning <= caution) {
      warning = Math.min(95, caution + 5);
      $("warningThreshold").value = warning;
      $("warningLabel").textContent = warning;
    }
    return { caution, warning };
  }
  function getState(temp) {
    const { caution, warning } = thresholds();
    return temp >= warning ? "warning" : temp >= caution ? "caution" : "normal";
  }
  function formatTime(date = new Date()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }
  function addEvent(event, temp, level, force = false) {
    if (!force && state.events.length && state.events[0].event === event && state.events[0].level === level) return;
    state.events.unshift({ time: formatTime(), event, temp: Number(temp).toFixed(1), level });
    state.events = state.events.slice(0, 35);
    renderEvents();
  }
  function renderEvents() {
    const body = $("eventRows");
    if (!state.events.length) {
      body.innerHTML = '<tr class="empty-row"><td colspan="4">No events yet. Start the simulation to generate readings.</td></tr>';
      return;
    }
    body.innerHTML = state.events.map(e => `<tr><td>${e.time}</td><td>${e.event}</td><td>${e.temp}°C</td><td><span class="event-pill ${e.level}">${e.level.toUpperCase()}</span></td></tr>`).join("");
  }
  function updateChart() {
    const labels = state.history.map((x, i) => i === state.history.length - 1 ? "Now" : `${i + 1}`);
    chart.data.labels = labels;
    chart.data.datasets[0].data = state.history.map(x => x.temp);
    const { caution, warning } = thresholds();
    chart.data.datasets[1].data = state.history.map(() => caution);
    chart.data.datasets[2].data = state.history.map(() => warning);
    chart.update("none");
  }
  function render() {
    const level = getState(state.temperature);
    const { caution, warning } = thresholds();
    $("currentTemp").textContent = state.temperature.toFixed(1);
    $("peakTemp").textContent = state.peak.toFixed(1);
    $("alertCount").textContent = state.alertCount;
    $("stateValue").textContent = level.toUpperCase();
    $("stateValue").className = `state-value ${level}`;
    $("stateDot").className = `mini-dot ${level === "normal" ? "green" : "amber"}`;
    $("stateDescription").textContent = level === "normal" ? "Below caution threshold" : level === "caution" ? "Caution threshold reached" : "Warning threshold reached";
    const banner = $("alertBanner");
    banner.className = `alert-banner ${level === "normal" ? "normal-alert" : level === "caution" ? "caution-alert" : "warning-alert"}`;
    banner.querySelector(".alert-symbol").textContent = level === "normal" ? "✓" : level === "caution" ? "!" : "⚠";
    banner.querySelector("b").textContent = level === "normal" ? "Normal state" : level === "caution" ? "Caution state" : "Warning state";
    banner.querySelector("p").textContent = level === "normal" ? "Simulated temperature is below the caution threshold." : level === "caution" ? "Simulated temperature reached caution. Consider pausing in this demo." : "Warning threshold reached in simulation. Stop the simulated run and review the scenario.";
    $("normalRange").textContent = `< ${caution}°C`;
    $("cautionRange").textContent = `${caution}–${warning - 0.1 < caution ? warning : warning - 0.1}°C`;
    $("warningRange").textContent = `≥ ${warning}°C`;
    $("cautionLabel").textContent = caution;
    $("warningLabel").textContent = warning;
    $("liveDot").style.background = state.running ? colors.normal : "#aab3bf";
    $("runState").textContent = state.running ? "RUNNING" : "PAUSED";
    $("runState").parentElement.className = `live-pill ${state.running ? "running" : ""}`;
    $("startBtn").disabled = state.running;
    $("pauseBtn").disabled = !state.running;
  }
  function record(temp, force = false) {
    state.temperature = Math.max(20, Math.min(100, temp));
    state.peak = Math.max(state.peak, state.temperature);
    const level = getState(state.temperature);
    state.history.push({ temp: state.temperature, time: Date.now() });
    if (state.history.length > 36) state.history.shift();
    if (level !== state.previousState || force) {
      if (level !== "normal") state.alertCount += 1;
      const message = level === "normal" ? "Temperature normal" : level === "caution" ? "Caution threshold reached" : "Warning threshold reached";
      addEvent(message, state.temperature, level, true);
      state.previousState = level;
    } else if (state.ticks % 3 === 0) {
      addEvent("Temperature sample", state.temperature, level);
    }
    $("tempTrend").textContent = state.running ? "Updating every 1.5 seconds" : "Simulation paused";
    updateChart();
    render();
  }
  function tick() {
    state.ticks += 1;
    const mode = $("scenario").value;
    const current = state.temperature;
    let next = current;
    if (mode === "normal") next = 30 + Math.random() * 5 + Math.sin(state.ticks / 2) * 1.4;
    if (mode === "warming") next = current + (0.8 + Math.random() * 2.2);
    if (mode === "overheat") next = current + (4 + Math.random() * 6);
    if (mode === "cooling") next = Math.max(22, current - (1.5 + Math.random() * 2.5));
    if (mode === "manual") next = Number($("manualTemp").value) + (Math.random() * 1.2 - .6);
    if (next >= 100) next = 100;
    record(next);
    if (getState(next) === "warning" && state.running) pauseSimulation(true);
  }
  function startSimulation() {
    if (state.running) return;
    state.running = true;
    $("tempTrend").textContent = "Updating every 1.5 seconds";
    addEvent("Simulation started", state.temperature, getState(state.temperature), true);
    state.timer = setInterval(tick, 1500);
    render();
    showToast("Simulation started — all readings are simulated.");
  }
  function pauseSimulation(auto = false) {
    if (state.timer) clearInterval(state.timer);
    state.timer = null;
    state.running = false;
    render();
    if (auto) {
      addEvent("Simulation auto-paused at warning", state.temperature, "warning", true);
      showToast("Warning threshold reached. Simulation paused.");
    } else {
      addEvent("Simulation paused", state.temperature, getState(state.temperature), true);
      showToast("Simulation paused.");
    }
  }
  function resetSimulation() {
    if (state.timer) clearInterval(state.timer);
    state.timer = null; state.running = false; state.temperature = initialTemp; state.peak = initialTemp;
    state.alertCount = 0; state.previousState = "normal"; state.ticks = 0; state.history = []; state.events = [];
    state.history.push({ temp: initialTemp, time: Date.now() });
    addEvent("Simulation reset", initialTemp, "normal", true);
    updateChart(); render(); showToast("Simulation reset.");
  }
  function showToast(message) {
    const toast = $("toast");
    toast.textContent = message; toast.classList.add("show");
    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => toast.classList.remove("show"), 2500);
  }
  $("startBtn").addEventListener("click", startSimulation);
  $("pauseBtn").addEventListener("click", () => pauseSimulation(false));
  $("resetBtn").addEventListener("click", resetSimulation);
  $("scenario").addEventListener("change", () => {
    const mode = $("scenario").value;
    if (mode === "manual") record(Number($("manualTemp").value), true);
    else if (mode === "cooling" && !state.running) showToast("Press Start to simulate cooling.");
    else if (!state.running) showToast("Scenario selected. Press Start to run.");
  });
  $("manualTemp").addEventListener("input", () => {
    $("manualTempLabel").textContent = $("manualTemp").value;
    if ($("scenario").value === "manual" && !state.running) record(Number($("manualTemp").value), true);
  });
  ["cautionThreshold","warningThreshold"].forEach(id => $(id).addEventListener("input", () => {
    thresholds(); render(); updateChart();
    if (!state.running) record(state.temperature, true);
  }));
  $("clearLogBtn").addEventListener("click", () => { state.events = []; renderEvents(); showToast("Event log cleared."); });
  $("exportBtn").addEventListener("click", () => {
    const rows = [["Time","Event","Temperature_C","State"], ...state.events.map(e => [e.time,e.event,e.temp,e.level])];
    const csv = rows.map(row => row.map(v => `"${String(v).replaceAll('"','""')}"`).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "heatguard-simulation-log.csv"; a.click();
    URL.revokeObjectURL(url); showToast("Simulation log exported as CSV.");
  });
  document.querySelectorAll(".nav-link").forEach(link => link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach(item => item.classList.remove("active"));
    link.classList.add("active");
  }));
  state.history.push({ temp: initialTemp, time: Date.now() });
  render(); updateChart();
  addEvent("Simulation ready", initialTemp, "normal", true);
})();