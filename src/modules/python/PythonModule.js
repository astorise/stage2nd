import { BaseModule } from '@core/BaseModule';

export default class PythonModule extends BaseModule {
  constructor() {
    super('python', 'Python', '🐍');
    
    this.capabilities = {
      console: true,
      preview: false,
      multiFile: false,
      packages: true
    };
    
    this.pyodide = null;
    this.loadingPromise = null;
  }
  
  async init() {
    // Commencer le chargement de Pyodide
    this.loadingPromise = this.loadPyodide();
    
    return {
      editorConfig: {
        language: 'python',
        theme: 'vs-dark'
      }
    };
  }
  
  async loadPyodide() {
    if (this.pyodide) return this.pyodide;
    
    try {
      // Ajouter le script Pyodide
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
      document.head.appendChild(script);
      
      // Attendre que le script soit chargé
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });
      
      // Afficher un message de chargement
      window.codePlayApp.ui.console.info('Chargement de Python...');
      
      // Initialiser Pyodide
      this.pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
        stdout: (text) => {
          window.codePlayApp.ui.console.log(text);
        },
        stderr: (text) => {
          window.codePlayApp.ui.console.error(text);
        }
      });
      
      // Configuration de base
      await this.pyodide.runPythonAsync(`
import sys
import io
from js import console

# Rediriger la sortie
class ConsoleOutput:
    def write(self, text):
        if text.strip():
            console.log(text)
    
    def flush(self):
        pass

sys.stdout = ConsoleOutput()
sys.stderr = ConsoleOutput()

# Importer les modules de base
import math
import random
import datetime
      `);
      
      window.codePlayApp.ui.console.success('Python prêt !');
      
      return this.pyodide;
      
    } catch (error) {
      console.error('Erreur lors du chargement de Pyodide:', error);
      throw error;
    }
  }
  
  async execute(code, context = {}) {
    const logs = [];
    const errors = [];
    
    try {
      // Attendre que Pyodide soit chargé
      await this.loadingPromise;
      
      // Intercepter les sorties console
      const originalLog = console.log;
      const originalError = console.error;
      
      console.log = (...args) => {
        logs.push({ type: 'log', args });
        originalLog.apply(console, args);
      };
      
      console.error = (...args) => {
        logs.push({ type: 'error', args });
        originalError.apply(console, args);
      };
      
      // Exécuter le code Python
      const result = await this.pyodide.runPythonAsync(code);
      
      // Si le résultat n'est pas None, l'afficher
      if (result !== undefined && result !== null) {
        const repr = this.pyodide.runPython(`repr(${result})`);
        logs.push({ type: 'log', args: [repr] });
      }
      
      // Restaurer console
      console.log = originalLog;
      console.error = originalError;
      
      return {
        success: true,
        logs,
        errors,
        result
      };
      
    } catch (error) {
      // Parser l'erreur Python
      const errorMessage = this.parsePythonError(error);
      errors.push({
        message: errorMessage,
        stack: error.stack,
        line: this.extractErrorLine(error)
      });
      
      // Restaurer console
      console.log = console.log;
      console.error = console.error;
      
      return {
        success: false,
        logs,
        errors
      };
    }
  }
  
  parsePythonError(error) {
    // Extraire le message d'erreur Python
    const errorStr = error.toString();
    
    // Nettoyer le message
    if (errorStr.includes('PythonError:')) {
      return errorStr.replace('PythonError: ', '');
    }
    
    return errorStr;
  }
  
  extractErrorLine(error) {
    // Essayer d'extraire le numéro de ligne de l'erreur Python
    const match = error.toString().match(/line (\d+)/);
    return match ? parseInt(match[1]) : null;
  }
  
  async installPackage(packageName) {
    if (!this.pyodide) {
      throw new Error('Python n\'est pas encore chargé');
    }
    
    try {
      await this.pyodide.loadPackage(packageName);
      window.codePlayApp.ui.console.success(`Package ${packageName} installé`);
      return true;
    } catch (error) {
      window.codePlayApp.ui.console.error(`Impossible d'installer ${packageName}`);
      return false;
    }
  }
  
  getStarterCode() {
    return `# Bienvenue dans l'éditeur Python !
# Python s'exécute directement dans ton navigateur grâce à Pyodide

print("Bonjour, CodePlay ! 🐍")

# Tu peux utiliser les fonctionnalités Python habituelles
nom = "Alice"
age = 15

print(f"Je m'appelle {nom} et j'ai {age} ans")

# Les listes
nombres = [1, 2, 3, 4, 5]
doubles = [n * 2 for n in nombres]
print(f"Nombres doublés: {doubles}")

# Les fonctions
def saluer(nom):
    return f"Salut {nom} ! 👋"

message = saluer("CodePlay")
print(message)

# Modules disponibles
import math
print(f"Pi = {math.pi:.4f}")

import random
nombre_aleatoire = random.randint(1, 100)
print(f"Nombre aléatoire: {nombre_aleatoire}")
`;
  }
  
  async cleanup() {
    // Pyodide reste en mémoire pour éviter de le recharger
    // On pourrait le décharger si nécessaire
  }
}
