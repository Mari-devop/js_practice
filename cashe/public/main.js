if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => console.log("Service worker registered", reg.scope))
      .catch((err) => console.error("Service worker registration failed", err));
  });
}
