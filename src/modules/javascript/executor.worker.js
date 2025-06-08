// src/modules/javascript/executor.worker.js
self.addEventListener('message', async (event) => {
  const { id, code, options } = event.data;
  const logs = [];
  let error = null;
  
  // Capturer console.log
  const originalLog = console.log;
  console.log = (...args) => {
    logs.push({
      type: 'log',
      timestamp: Date.now(),
      args: args.map(arg => {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      })
    });
  };
  
  try {
    // Créer une fonction isolée
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    const userFunction = new AsyncFunction(code);
    
    // Exécuter avec timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), options.timeout || 5000);
    });
    
    await Promise.race([userFunction(), timeoutPromise]);
  } catch (err) {
    error = {
      message: err.message,
      stack: err.stack,
      line: err.line
    };
  } finally {
    console.log = originalLog;
  }
  
  self.postMessage({
    id,
    result: {
      logs,
      error,
      success: !error
    }
  });
});