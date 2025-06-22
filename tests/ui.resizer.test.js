/* @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/components/Editor/Editor', () => ({ Editor: class {} }));
vi.mock('@/components/Console/Console', () => ({ Console: class {} }));
vi.mock('@/components/NetworkMonitor/NetworkMonitor', () => ({ NetworkMonitor: class {} }));
vi.mock('@/components/TestRunner/TestRunner', () => ({ TestRunner: class {} }));
vi.mock('@/components/ChatWidget/ChatWidget', () => ({ ChatWidget: class {} }));

import { UIManager } from '@/core/UIManager';

class DummyApp { constructor(){ this.config={}; this.modules={}; } }

describe('UIManager output resizer', () => {
  it('updates outputContainer height when dragged', () => {
    document.body.innerHTML = '<div id="app"></div>';
    const ui = new UIManager(new DummyApp());
    ui.createUI();
    ui.elements.outputContainer = document.getElementById('output-container');
    ui.elements.outputResizer = document.getElementById('output-resizer');

    Object.defineProperty(ui.elements.outputContainer, 'offsetHeight', { configurable: true, value: 100 });

    ui.setupOutputResizer();

    ui.elements.outputResizer.dispatchEvent(new MouseEvent('mousedown', { clientY: 200 }));
    document.dispatchEvent(new MouseEvent('mousemove', { clientY: 150 }));
    document.dispatchEvent(new MouseEvent('mouseup'));

    expect(ui.elements.outputContainer.style.height).toBe('150px');
  });
});
