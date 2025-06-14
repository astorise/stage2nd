import './styles/main.css';
import { CodePlayApp } from '@core/App';

// Initialiser l'application
const app = new CodePlayApp();

// Démarrer quand le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

// Exposer globalement pour le debug
window.codePlayApp = app;
