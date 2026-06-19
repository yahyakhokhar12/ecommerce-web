import { describe, expect, it } from 'vitest';
import { formatPrice, truncate } from './utils.js';

describe('utils', () => {
  it('formats prices consistently', () => {
    expect(formatPrice(49.99)).toBe('$49.99');
  });

  it('truncates long text', () => {
    expect(truncate('production ready ecommerce', 10)).toBe('production...');
  });
});
