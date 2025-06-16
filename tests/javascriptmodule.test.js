import { describe, it, expect } from 'vitest';
import JavaScriptModule from '@/modules/javascript/JavaScriptModule';

describe('JavaScriptModule utility methods', () => {
  const mod = new JavaScriptModule();

  it('withTimeout resolves before timeout', async () => {
    const result = await mod.withTimeout(Promise.resolve('ok'), 10);
    expect(result).toBe('ok');
  });

  it('withTimeout rejects on timeout', async () => {
    await expect(mod.withTimeout(new Promise(r => setTimeout(r, 20)), 5)).rejects.toThrow('Execution timeout');
  });

  it('extractErrorLine returns line number', () => {
    const err = new Error('test');
    err.stack = 'Error\n    at <anonymous>:5:10';
    expect(mod.extractErrorLine(err)).toBe(5);
  });
});
