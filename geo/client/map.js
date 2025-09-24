(function (global) {
  let map, userMarker;
  let circleLayers = [];

  function ensureLeaflet(cb) {
    if (window.L) return cb();
    const s = document.createElement("script");
    s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    s.onload = cb;
    document.head.appendChild(s);
  }

  function initMap(center = [51.5079, -0.0877], zoom = 15) {
    map = L.map("map").setView(center, zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      map
    );
  }

  function setUser(lat, lng) {
    if (!map) return;
    if (!userMarker) {
      const userIcon = L.divIcon({
        className: 'user-marker',
        html: '<div class="user-marker-inner"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      
      userMarker = L.marker([lat, lng], { icon: userIcon })
        .addTo(map)
        .bindPopup("You are here");
    } else {
      userMarker.setLatLng([lat, lng]);
    }
  }

  function centerOnUser(lat, lng) {
    if (!map) return;
    map.setView([lat, lng], 16);
  }

  function renderPOIs(pois) {
    circleLayers.forEach((c) => map.removeLayer(c));
    circleLayers = [];
    pois.forEach((p) => {
      L.marker([p.coords.lat, p.coords.lng]).addTo(map).bindPopup(p.title);
      const c = L.circle([p.coords.lat, p.coords.lng], {
        radius: p.radius,
      }).addTo(map);
      circleLayers.push(c);
    });
  }

  global.MapView = { ensureLeaflet, initMap, setUser, centerOnUser, renderPOIs };
})(window);
