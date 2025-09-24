window.GeoUtil = {
  toRad: (x) => (x * Math.PI) / 180,
  distanceMeters(a, b) {
    const R = 6371000;
    const dLat = this.toRad(b.lat - a.lat);
    const dLng = this.toRad(b.lng - a.lng);
    const lat1 = this.toRad(a.lat),
      lat2 = this.toRad(b.lat);
    const s1 = Math.sin(dLat / 2) ** 2;
    const s2 = Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    return 2 * R * Math.asin(Math.sqrt(s1 + s2));
  },
};
