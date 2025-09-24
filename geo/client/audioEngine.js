(function (global) {
  class AudioEngine {
    constructor() {
      this.ctx = null;
      this.gain = null;
      this.currentSrc = null;
      this.currentUrl = null;
    }
    ensure() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
        this.gain = this.ctx.createGain();
        this.gain.gain.value = 0;
        this.gain.connect(this.ctx.destination);
      }
    }
    async loadBuffer(url) {
      const res = await fetch(url);
      const buf = await res.arrayBuffer();
      return await this.ctx.decodeAudioData(buf);
    }
    async play(url, onTitle) {
      this.ensure();
      if (this.currentUrl === url && this.currentSrc) return;

      const buffer = await this.loadBuffer(url);
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(this.gain);

      const now = this.ctx.currentTime;
      if (this.currentSrc) {
        this.gain.gain.cancelScheduledValues(now);
        this.gain.gain.setValueAtTime(this.gain.gain.value, now);
        this.gain.gain.linearRampToValueAtTime(0, now + 0.8);
        this.currentSrc.stop(now + 0.85);
      }

      src.start();
      this.currentSrc = src;
      this.currentUrl = url;

      this.gain.gain.cancelScheduledValues(now + 0.85);
      this.gain.gain.setValueAtTime(0, now + 0.85);
      this.gain.gain.linearRampToValueAtTime(1, now + 1.6);

      if (typeof onTitle === "function") onTitle(url);
    }
    stop() {
      if (!this.ctx || !this.currentSrc) return;
      const now = this.ctx.currentTime;
      this.gain.gain.cancelScheduledValues(now);
      this.gain.gain.setValueAtTime(this.gain.gain.value, now);
      this.gain.gain.linearRampToValueAtTime(0, now + 0.8);
      this.currentSrc.stop(now + 0.85);
      this.currentSrc = null;
      this.currentUrl = null;
    }
    resume() {
      this.ensure();
      return this.ctx.resume();
    }
  }
  global.AudioEngine = AudioEngine;
})(window);
