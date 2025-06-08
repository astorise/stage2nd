import { BaseModule } from '@core/BaseModule';

export default class JavaScriptModule extends BaseModule {
  constructor() {
    super('javascript', 'JavaScript', '🟨');
    
    this.capabilities = {
      console: true,
      preview: false,
      multiFile: false,
      packages: false
    };
  }
  
  async init() {
    // Configuration spécifique JavaScript
    return {
      editorConfig: {
        language: 'javascript',
        theme: 'vs-dark'
      }
    };
  }
  
  async execute(code, context = {}) {
    const logs = [];
    const errors = [];
    
    // Créer un environnement d'exécution isolé
    const sandbox = this.createSandbox(logs, errors);
    
    try {
      // Créer une fonction avec le code utilisateur
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const userFunction = new AsyncFunction(...Object.keys(sandbox), code);
      
      // Exécuter avec timeout
      const timeoutMs = context.timeout || 5000;
      const result = await this.withTimeout(
        userFunction(...Object.values(sandbox)),
        timeoutMs
      );
      
      return {
        success: true,
        logs,
        errors,
        result
      };
      
    } catch (error) {
      errors.push({
        message: error.message,
        stack: error.stack,
        line: this.extractErrorLine(error)
      });
      
      return {
        success: false,
        logs,
        errors
      };
    }
  }
  
  createSandbox(logs, errors) {
    return {
      console: {
        log: (...args) => logs.push({ type: 'log', args }),
        error: (...args) => logs.push({ type: 'error', args }),
        warn: (...args) => logs.push({ type: 'warn', args }),
        info: (...args) => logs.push({ type: 'info', args }),
        clear: () => logs.length = 0
      },
      // Ajouter des utilitaires sûrs
      setTimeout: (fn, ms) => {
        if (ms > 5000) throw new Error('Timeout trop long');
        return setTimeout(fn, ms);
      },
      setInterval: (fn, ms) => {
        if (ms < 100) throw new Error('Intervalle trop court');
        return setInterval(fn, ms);
      },
      // Bloquer les APIs dangereuses
      fetch: undefined,
      XMLHttpRequest: undefined,
      eval: undefined,
      Function: undefined
    };
  }
  
  async withTimeout(promise, ms) {
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Execution timeout')), ms)
    );
    return Promise.race([promise, timeout]);
  }
  
  extractErrorLine(error) {
    // Extraire le numéro de ligne de l'erreur
    const match = error.stack?.match(/<anonymous>:(\d+):(\d+)/);
    return match ? parseInt(match[1]) : null;
  }
  
  getStarterCode() {
    return `// Bienvenue dans l'éditeur JavaScript !
// Appuie sur Ctrl+Enter pour exécuter ton code

console.log("Hello, World! 👋");

// Essaie de modifier ce code
const nom = "CodePlay";
console.log(\`Bienvenue sur \${nom}!\`);

// Tu peux utiliser toutes les fonctionnalités modernes
const nombres = [1, 2, 3, 4, 5];
const doubles = nombres.map(n => n * 2);
console.log("Nombres doublés:", doubles);
`;
  }
}