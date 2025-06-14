/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from 'vitest';
import { NetworkMonitor } from '@/components/NetworkMonitor/NetworkMonitor';

describe('NetworkMonitor utility methods', () => {
  const proto = NetworkMonitor.prototype;
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { origin: 'http://example.com' },
    });
  });

  it('formatUrl removes origin for same domain', () => {
    expect(proto.formatUrl.call({}, 'http://example.com/api')).toBe('/api');
    expect(proto.formatUrl.call({}, '/test?q=1')).toBe('/test?q=1');
  });

  it('formatUrl keeps hostname for external domains', () => {
    expect(proto.formatUrl.call({}, 'https://other.com/path')).toBe('other.com/path');
  });

  it('formatSize formats bytes properly', () => {
    expect(proto.formatSize.call({}, 0)).toBe('0 B');
    expect(proto.formatSize.call({}, 1024)).toBe('1 KB');
    expect(proto.formatSize.call({}, 1048576)).toBe('1 MB');
  });

  it('getStatusClass returns expected classes', () => {
    expect(proto.getStatusClass.call({}, 'pending')).toBe('pending');
    expect(proto.getStatusClass.call({}, 200)).toBe('success');
    expect(proto.getStatusClass.call({}, 301)).toBe('redirect');
    expect(proto.getStatusClass.call({}, 404)).toBe('error');
    expect(proto.getStatusClass.call({}, 0)).toBe('');
  });
});
