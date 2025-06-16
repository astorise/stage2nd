import { describe, it, expect } from 'vitest';
import { ModuleManager } from '@/core/ModuleManager';
import { LessonManager } from '@/core/LessonManager';

class DummyApp { constructor(){ this.ui={}; this.storage={}; this.modules={ getActiveModule:()=>({}) }; }}

describe('ModuleManager helpers', () => {
  const manager = new ModuleManager(new DummyApp());
  it('returns module names and icons', () => {
    expect(manager.getModuleName('javascript')).toBe('JavaScript');
    expect(manager.getModuleName('unknown')).toBe('unknown');
    expect(manager.getModuleIcon('web')).toBe('🌐');
    expect(manager.getModuleIcon('other')).toBe('📦');
  });
});

describe('LessonManager helpers', () => {
  const lessonManager = new LessonManager(new DummyApp());

  it('getDifficultyIcon returns emoji', () => {
    expect(lessonManager.getDifficultyIcon('facile')).toBe('🟢');
    expect(lessonManager.getDifficultyIcon('moyen')).toBe('🟡');
    expect(lessonManager.getDifficultyIcon('difficile')).toBe('🔴');
  });

  it('markdownToHtml converts headings and code', () => {
    const md = '# Title\n\n```javascript\nconsole.log("hi")\n```';
    const html = lessonManager.markdownToHtml(md);
    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('console.log("hi")');
  });

  it('generateDefaultReadme includes sections', () => {
    const ex = { title: 'Ex', description: 'Desc', difficulty: 'facile' };
    const text = lessonManager.generateDefaultReadme(ex);
    expect(text).toContain('# Ex');
    expect(text).toContain('## Description');
    expect(text).toContain('Desc');
  });

  it('calculateStats aggregates completion', () => {
    lessonManager.exercises = new Map([
      ['c1/e1',{ chapterId:'c1', difficulty:'facile'}],
      ['c1/e2',{ chapterId:'c1', difficulty:'moyen'}],
      ['c2/e3',{ chapterId:'c2', difficulty:'difficile'}],
    ]);
    lessonManager.completedExercises = new Set(['c1/e1','c2/e3']);
    const stats = lessonManager.calculateStats();
    expect(stats.total).toBe(3);
    expect(stats.completed).toBe(2);
    expect(stats.byChapter.c1).toBe(1);
    expect(stats.byDifficulty.facile).toBe(1);
    expect(stats.byDifficulty.difficile).toBe(1);
  });
});
