const { performance } = require('perf_hooks');

class PerformanceLogger {
  constructor() {
    this.startTime = performance.now();
    this.lapTime = this.startTime;
  }

  lap(msg) {
    const now = performance.now();
    const time = now - this.lapTime;
    console.info(`[${time}ms] ${msg}`);
    this.lapTime = now;
  }

  end(msg) {
    const now = performance.now();
    const time = now - this.startTime;
    console.info(`[time=${time}ms] ${msg}`);
  }
}

module.exports = PerformanceLogger;
