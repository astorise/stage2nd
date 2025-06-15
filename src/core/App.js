import { EventEmitter } from "eventemitter3";
import { ModuleManager } from "./ModuleManager";
import { StorageService } from "@services/StorageService";
import { UIManager } from "./UIManager";
import { LessonManager } from "./LessonManager";
import { CourseManager } from './CourseManager';

export class CodePlayApp extends EventEmitter {
  constructor() {
    super();
    
    this.courses = new CourseManager(this);  // Nouveau !
    this.modules = new ModuleManager(this);
    this.storage = new StorageService();
    this.ui = new UIManager(this);
    this.lessons = new LessonManager(this);
  }
  
  async init() {
    try {
      // Charger la configuration
      await this.loadConfig();

      // Initialiser l'interface
      await this.ui.init();
      
      // Charger les modules disponibles
      await this.modules.loadAvailableModules();
      
      // Initialiser le gestionnaire de cours
      await this.courses.init();  // Nouveau !
      
      // Vérifier les mises à jour périodiquement
      setInterval(() => {
        this.courses.checkForUpdates();
      }, 300000); // Toutes les 5 minutes
      
      this.emit('app:ready');
      
    } catch (error) {
      console.error('❌ Failed to initialize CodePlay:', error);
      this.ui.showError('Erreur lors de l\'initialisation');
    }
  }


  async loadConfig() {
    try {
      const response = await fetch("config.json");
      this.config = await response.json();
      const defaults = { host: '0.peerjs.com', port: 443, secure: true, rtcConfig: null };
      const { peerServer = {} } = this.config;
      this.config.peerServer = {
        ...defaults,
        ...peerServer,
      };
    } catch (error) {
      // Configuration par défaut
      this.config = {
        modules: ["javascript", "python", "web"],
        features: {
          github: false,
          collaboration: false,
        },
        lessonsUrl: "lessons/manifest.json",
        peerServer: { host: '0.peerjs.com', port: 443, secure: true, rtcConfig: null },
      };
    }
  }

  async restoreSession() {
    const lastSession = await this.storage.get("lastSession");
    if (lastSession) {
      if (lastSession.moduleId) {
        await this.modules.activateModule(lastSession.moduleId);
      }
      if (lastSession.lessonId) {

        try {
          await this.lessons.loadExercise(lastSession.lessonId);
          this.currentLesson = this.lessons.currentExercise;
        } catch (err) {
          console.warn("Could not restore lesson:", err);
        }

      }
    }
  }

  async saveSession() {
    await this.storage.set("lastSession", {
      moduleId: this.currentModule?.id,
      lessonId: this.currentLesson?.fullId ?? this.currentLesson?.id, // full ID
      timestamp: Date.now(),
    });
  }
}
