import { describe, it, expect, vi } from 'vitest';
import { on, emit } from '../../src/core/events.js';

describe('Ereignisse', () => {
  it('erreichen alle Empfänger, auch wenn einer abstürzt', () => {
    const a = vi.fn(), b = vi.fn();
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    on('test:x', () => { throw new Error('kaputt'); });
    on('test:x', a); const off = on('test:x', b);
    emit('test:x', { n: 1 });
    expect(a).toHaveBeenCalledWith({ n: 1 }); expect(b).toHaveBeenCalledTimes(1);
    off(); emit('test:x', {}); expect(b).toHaveBeenCalledTimes(1);
    err.mockRestore();
  });
});
