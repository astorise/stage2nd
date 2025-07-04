/* @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { Console } from '@/components/Console/Console';

describe('Console.formatValue', () => {
  const formatValue = Console.prototype.formatValue;

  it('formats null and undefined', () => {
    expect(formatValue(null)).toBe('null');
    expect(formatValue(undefined)).toBe('undefined');
  });

  it('formats objects and arrays', () => {
    expect(formatValue({ a: 1 })).toBe(JSON.stringify({ a: 1 }, null, 2));
    expect(formatValue([1, 2])).toBe(JSON.stringify([1, 2], null, 2));
  });

  it('formats functions and primitives', () => {
    const fn = function test() {};
    expect(formatValue(fn)).toContain('function test');
    expect(formatValue(42)).toBe('42');
    expect(formatValue('hello')).toBe('hello');
  });
});

describe('Console.success', () => {
  it('adds a success log entry and element', () => {
    document.body.innerHTML = '<div id="c"></div>';
    const c = new Console(document.getElementById('c'));
    c.success('yay');

    expect(c.logs[0].type).toBe('success');
    const elem = document.querySelector('.console-entry.console-success');
    expect(elem).toBeTruthy();
    expect(elem.textContent).toContain('yay');
  });
});
