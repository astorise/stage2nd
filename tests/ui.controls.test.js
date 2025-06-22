/* @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/components/Editor/Editor', () => ({ Editor: class {} }));
vi.mock('@/components/Console/Console', () => ({ Console: class {} }));
vi.mock('@/components/NetworkMonitor/NetworkMonitor', () => ({ NetworkMonitor: class {} }));
vi.mock('@/components/TestRunner/TestRunner', () => ({ TestRunner: class {} }));
vi.mock('@/components/ChatWidget/ChatWidget', () => ({ ChatWidget: class {} }));

import { UIManager } from '@/core/UIManager';

class DummyApp { constructor(){ this.config = {}; this.modules = {}; } }

describe('UIManager required controls', () => {
  it('creates essential buttons', () => {
    document.body.innerHTML = '<div id="app"></div>';
    const ui = new UIManager(new DummyApp());
    ui.createUI();

    expect(document.getElementById('btn-run')).toBeTruthy();
    expect(document.getElementById('btn-reset')).toBeTruthy();
    expect(document.getElementById('btn-chat-toggle')).toBeTruthy();
    expect(document.getElementById('btn-sidebar-toggle')).toBeTruthy();
  });
});
