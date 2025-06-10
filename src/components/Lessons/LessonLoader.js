class LessonLoader {
  constructor() {
    this.manifestPath = '/lessons/javascript/manifest.json';
    this.lessonsPath = '/lessons/javascript';
    this.manifest = null;
    this.currentLesson = null;
    this.progress = this.loadProgress();
  }

  async loadManifest() {
    try {
      const response = await fetch(this.manifestPath);
      this.manifest = await response.json();
      return this.manifest;
    } catch (error) {
      console.error('Erreur lors du chargement du manifest:', error);
      throw error;
    }
  }

  async loadLesson(chapterId, lessonId) {
    if (!this.manifest) await this.loadManifest();
    
    const chapter = this.manifest.structure.chapters.find(c => c.id === chapterId);
    const lesson = chapter?.lessons.find(l => l.id === lessonId);
    
    if (!lesson) throw new Error('Leçon non trouvée');

    const lessonPath = `${this.lessonsPath}/${chapterId}/${lessonId}`;
    
    // Charger tous les fichiers de la leçon
    const files = {};
    for (const [type, filename] of Object.entries(lesson.files)) {
      try {
        const response = await fetch(`${lessonPath}/${filename}`);
        files[type] = await response.text();
      } catch (error) {
        console.warn(`Fichier non trouvé: ${filename}`);
        files[type] = '';
      }
    }

    this.currentLesson = {
      ...lesson,
      chapterId,
      files,
      path: lessonPath
    };

    return this.currentLesson;
  }

  loadProgress() {
    return JSON.parse(localStorage.getItem('codeplay-lessons-progress') || '{}');
  }

  saveProgress(chapterId, lessonId, data = {}) {
    if (!this.progress[chapterId]) this.progress[chapterId] = {};
    this.progress[chapterId][lessonId] = {
      ...this.progress[chapterId][lessonId],
      ...data,
      lastAccessed: new Date().toISOString()
    };
    localStorage.setItem('codeplay-lessons-progress', JSON.stringify(this.progress));
  }

  markLessonCompleted(chapterId, lessonId) {
    this.saveProgress(chapterId, lessonId, {
      completed: true,
      completedAt: new Date().toISOString()
    });
  }

  getProgressStats() {
    let totalLessons = 0;
    let completedLessons = 0;

    this.manifest?.structure.chapters.forEach(chapter => {
      chapter.lessons.forEach(lesson => {
        totalLessons++;
        const progress = this.progress[chapter.id]?.[lesson.id];
        if (progress?.completed) completedLessons++;
      });
    });

    return {
      total: totalLessons,
      completed: completedLessons,
      percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
    };
  }
}