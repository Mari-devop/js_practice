const statusEl = document.getElementById("status");
const btnStart = document.getElementById("btn-start");
const nowPlayingEl = document.getElementById("now-playing");

const audio = new AudioEngine();

nowPlayingEl.textContent = "—";
statusEl.textContent = "idle";

const ws = new WSClient(`ws://localhost:3032`);

let currentActiveId = null;

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js", { scope: "./" })
      .catch(console.error);
  });
}

ws.onPOIs = (pois) => {
  console.log("POIs received:", pois);
  MapView.renderPOIs(pois);
};

ws.onNearby = ({ active, prefetch }) => {
  console.log("onNearby called:", { active, prefetch });
  
  if (Array.isArray(prefetch)) {
    prefetch.forEach((u) => fetch(u).catch(() => {}));
  }
  if (!active) {
    if (currentActiveId) {
      currentActiveId = null;
      audio.stop();
      nowPlayingEl.textContent = "—";
      nowPlayingEl.classList.remove("playing");
      statusEl.textContent = "No POI nearby";
      statusEl.className = "idle";
    }
    return;
  }
  if (active.id !== currentActiveId) {
    currentActiveId = active.id;
    console.log("Playing audio:", active.title, active.audio);
    audio.play(active.audio, () => {
      nowPlayingEl.textContent = `▶ ${active.title}`;
      nowPlayingEl.classList.add("playing");
      statusEl.textContent = "Playing";
      statusEl.className = "playing";
    });
  }
};

btnStart.addEventListener("click", async () => {
  try {
    await audio.resume(); 
    statusEl.textContent = "Awaiting location...";

    MapView.ensureLeaflet(() => MapView.initMap());

    navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        console.log("Location received:", latitude, longitude, accuracy);
        MapView.setUser(latitude, longitude);
        MapView.centerOnUser(latitude, longitude);
        ws.send({ type: "LOCATION", lat: latitude, lng: longitude, accuracy });
        statusEl.textContent = `Connected (${accuracy.toFixed(0)}m accuracy)`;
        statusEl.className = "connected";
      },
      (err) => {
        console.error("Geolocation error:", err);
        statusEl.textContent = "Geolocation error: " + err.message;
        statusEl.className = "idle";
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 8000 }
    );

    ws.connect();
    statusEl.textContent = "Connected";
    statusEl.className = "connected";
  } catch (e) {
    alert("Дайте доступ до геолокації та звуку 🙏");
  }
});
