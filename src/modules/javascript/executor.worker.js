// src/modules/javascript/executor.worker.js
self.addEventListener('message', async (event) => {
  const { id, code, options = {} } = event.data;
  const logs = [];
  const errors = [];

  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info
  };

  const capture = (type) => (...args) => {
    logs.push({ type, args });
  };

  console.log = capture('log');
  console.error = capture('error');
  console.warn = capture('warn');
  console.info = capture('info');

  let success = true;

  try {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    const fn = new AsyncFunction(code);
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), options.timeout || 5000);
    });

    await Promise.race([fn(), timeout]);
  } catch (err) {
    success = false;
    errors.push({
      message: err.message,
      stack: err.stack,
      line: err.lineNumber || err.line || null
    });
  } finally {
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
  }

  self.postMessage({ id, logs, errors, success });

  if (options.terminate) {
    self.close();
  }
});
