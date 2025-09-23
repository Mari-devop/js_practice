(function (global) {
  class WSClient {
    constructor(url) {
      this.url = url;
      this.ws = null;
      this.onPOIs = () => {};
      this.onNearby = () => {};
    }
    connect() {
      console.log("Connecting to WebSocket:", this.url);
      this.ws = new WebSocket(this.url);
      this.ws.addEventListener("open", () => {
        console.log("WebSocket connected successfully");
      });
      this.ws.addEventListener("message", (e) => {
        console.log("WebSocket message received:", e.data);
        let data;
        try {
          data = JSON.parse(e.data);
        } catch {
          console.error("Failed to parse WebSocket message:", e.data);
          return;
        }
        console.log("Parsed data:", data);
        if (data.type === "POIS") this.onPOIs(data.pois);
        if (data.type === "NEARBY") this.onNearby(data);
      });
      this.ws.addEventListener("close", () => {
        console.log("WebSocket connection closed, reconnecting in 1 second...");
        setTimeout(() => this.connect(), 1000);
      });
      this.ws.addEventListener("error", (error) => {
        console.error("WebSocket error:", error);
      });
    }
    send(obj) {
      if (this.ws && this.ws.readyState === 1) {
        this.ws.send(JSON.stringify(obj));
      }
    }
  }
  global.WSClient = WSClient;
})(window);
