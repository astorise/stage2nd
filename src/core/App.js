import { EventEmitter } from 'eventemitter3';
import { ModuleManager } from './ModuleManager';
import { StorageService } from '@services/StorageService';
import { UIManager } from './UIManager';
import { LessonManager } from './LessonManager';

export class CodePlayApp extends EventEmitter {
  constructor() {
    super();
    
    this.modules = new ModuleManager(this);
    this.storage = new StorageService();
    this.ui = new UIManager(this);
    this.lessons = new LessonManager(this);
    
    this.currentLesson = null;
    this.currentModule = null;
  }
  
  async init() {
    try {
      // Initialiser l'interface
      await this.ui.init();
      
      // Charger la configuration
      await this.loadConfig();
      
      // Charger les modules disponibles
      await this.modules.loadAvailableModules();
      
      // Restaurer la session précédente
      await this.restoreSession();
      
      // Charger les leçons
      await this.lessons.loadManifest();
      
      this.emit('app:ready');
      console.log('✅ CodePlay initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize CodePlay:', error);
      this.ui.showError('Erreur lors de l\'initialisation');
    }
  }
  
  async loadConfig() {
    try {
      const response = await fetch('/config.json');
      this.config = await response.json();
    } catch (error) {
      // Configuration par défaut
      this.config = {
        modules: ['javascript', 'python', 'web'],
        features: {
          github: false,
          collaboration: false
        },
        lessonsUrl: '/lessons/manifest.json'
      };
    }
  }
  
  async restoreSession() {
    const lastSession = await this.storage.get('lastSession');
    if (lastSession) {
      if (lastSession.moduleId) {
        await this.modules.activateModule(lastSession.moduleId);
      }
      if (lastSession.lessonId) {
        await this.lessons.loadExercise(lastSession.lessonId);
        this.currentLesson = this.lessons.currentExercise;
      }
    }
  }
  
  async saveSession() {
    await this.storage.set('lastSession', {
      moduleId: this.currentModule?.id,
      lessonId: this.currentLesson?.id,
      timestamp: Date.now()
    });
  }
}