// src/core/CourseManager.js

export class CourseManager {
  constructor(app) {
    this.app = app;
    this.courses = new Map();
    this.currentCourse = null;
    this.rootManifest = null;
  }
  
  async init() {
    try {
      // Charger le manifest racine
      const response = await fetch('lessons/manifest.json');
      if (!response.ok) {
        throw new Error('Impossible de charger le catalogue des cours');
      }
      
      this.rootManifest = await response.json();
      
      // Filtrer les cours activés
      const enabledCourses = this.rootManifest.courses.filter(course => course.enabled);
      
      // Indexer les cours
      for (const course of enabledCourses) {
        this.courses.set(course.id, course);
      }
      
      // Afficher le sélecteur de cours
      this.renderCourseSelector();
      
      // Charger le dernier cours utilisé ou le premier disponible
      const lastCourseId = await this.app.storage.get('lastCourseId');
      const courseToLoad = lastCourseId && this.courses.has(lastCourseId) 
        ? lastCourseId 
        : enabledCourses[0]?.id;
        
      if (courseToLoad) {
        await this.loadCourse(courseToLoad);
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des cours:', error);
      throw error;
    }
  }
  
  renderCourseSelector() {
    const container = document.getElementById('course-selector');
    if (!container) return;
    
    container.innerHTML = `
      <div class="course-selector-wrapper">
        <label for="course-select">Cours :</label>
        <select id="course-select" class="course-select">
          ${Array.from(this.courses.values()).map(course => `
            <option value="${course.id}" ${course.comingSoon ? 'disabled' : ''}>
              ${course.icon} ${course.name} ${course.comingSoon ? '(Bientôt)' : ''}
            </option>
          `).join('')}
        </select>
      </div>
    `;
    
    // Gérer le changement de cours
    document.getElementById('course-select').addEventListener('change', async (e) => {
      await this.loadCourse(e.target.value);
    });
  }
  
  async loadCourse(courseId) {
    const course = this.courses.get(courseId);
    if (!course) {
      throw new Error(`Cours introuvable : ${courseId}`);
    }
    
    try {
      // Afficher un loader
      this.app.ui.showLoading('Chargement du cours...');
      
      // Charger le manifest du cours
      const manifestUrl = this.resolveUrl(course.url);
      const response = await fetch(manifestUrl);
      
      if (!response.ok) {
        throw new Error(`Impossible de charger le cours : ${course.name}`);
      }
      
      const courseManifest = await response.json();
      
      // Mettre à jour le cours avec son manifest complet
      course.manifest = courseManifest;
      course.baseUrl = manifestUrl.substring(0, manifestUrl.lastIndexOf('/'));
      
      this.currentCourse = course;
      
      // Sauvegarder le choix
      await this.app.storage.set('lastCourseId', courseId);
      
      // Activer le bon module d'exécution
      await this.app.modules.activateModule(course.module);
      
      // Passer le cours au LessonManager
      await this.app.lessons.loadCourse(course);
      
      // Mettre à jour l'UI
      this.updateCourseUI();
      
      // Afficher un message de bienvenue
      this.app.ui.console.info(`📚 Cours "${course.name}" chargé avec succès !`);
      
    } catch (error) {
      console.error('Erreur lors du chargement du cours:', error);
      this.app.ui.showError(`Impossible de charger le cours : ${error.message}`);
    } finally {
      this.app.ui.hideLoading();
    }
  }
  
  resolveUrl(url) {
    // Si c'est une URL absolue, la retourner telle quelle
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Sinon, la résoudre par rapport au chemin de base
    const base = new URL(import.meta.env.BASE_URL + 'lessons/', window.location.origin);
    return new URL(url, base).href;
  }
  
  updateCourseUI() {
    // Mettre à jour le sélecteur
    const select = document.getElementById('course-select');
    if (select && this.currentCourse) {
      select.value = this.currentCourse.id;
    }
    
    // Mettre à jour le titre ou d'autres éléments UI si nécessaire
    const headerTitle = document.querySelector('.header-course-name');
    if (headerTitle && this.currentCourse) {
      headerTitle.textContent = `${this.currentCourse.icon} ${this.currentCourse.name}`;
    }
  }
  
  async checkForUpdates() {
    if (!this.rootManifest?.settings?.checkForUpdates) return;
    
    try {
      const response = await fetch('lessons/manifest.json?t=' + Date.now());
      const newManifest = await response.json();
      
      if (newManifest.lastUpdated !== this.rootManifest.lastUpdated) {
        this.app.ui.showNotification(
          '🔄 De nouveaux cours sont disponibles ! Rechargez la page pour les voir.',
          'info'
        );
      }
    } catch (error) {
      console.warn('Impossible de vérifier les mises à jour:', error);
    }
  }
  
  getAvailableCourses() {
    return Array.from(this.courses.values()).filter(course => 
      course.enabled && !course.comingSoon
    );
  }
  
  getFeaturedCourses() {
    return Array.from(this.courses.values()).filter(course => 
      course.enabled && course.featured
    );
  }
  
  getCoursesByTag(tag) {
    return Array.from(this.courses.values()).filter(course => 
      course.enabled && course.tags?.includes(tag)
    );
  }
}
