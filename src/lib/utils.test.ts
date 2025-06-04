import { describe, it, expect } from 'vitest';
import { formatBookmarkCount } from './utils';

describe('formatBookmarkCount', () => {
  it('should return the count as string when count is 20 or less and hasMore is false', () => {
    expect(formatBookmarkCount(5)).toBe('5');
    expect(formatBookmarkCount(20)).toBe('20');
    expect(formatBookmarkCount(1)).toBe('1');
    expect(formatBookmarkCount(0)).toBe('0');
  });

  it('should return count with + prefix when count is more than 20', () => {
    expect(formatBookmarkCount(21)).toBe('+21');
    expect(formatBookmarkCount(50)).toBe('+50');
    expect(formatBookmarkCount(100)).toBe('+100');
  });

  it('should return count with + prefix when hasMore is true, regardless of count', () => {
    expect(formatBookmarkCount(5, true)).toBe('+5');
    expect(formatBookmarkCount(20, true)).toBe('+20');
    expect(formatBookmarkCount(15, true)).toBe('+15');
  });

  it('should return count with + prefix when count is more than 20 and hasMore is true', () => {
    expect(formatBookmarkCount(25, true)).toBe('+25');
    expect(formatBookmarkCount(50, true)).toBe('+50');
  });

  it('should return count with + prefix when count is more than 20 and hasMore is false', () => {
    expect(formatBookmarkCount(25, false)).toBe('+25');
    expect(formatBookmarkCount(50, false)).toBe('+50');
  });
});