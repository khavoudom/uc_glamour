import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn()', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('handles conditional classes (falsy values)', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });

  it('handles array arguments', () => {
    expect(cn(['a', 'b'], 'c')).toBe('a b c');
  });

  it('handles object arguments', () => {
    expect(cn({ a: true, b: false, c: true })).toBe('a c');
  });

  it('resolves tailwind conflicts (last wins)', () => {
    expect(cn('px-4', 'px-2')).toBe('px-2');
  });

  it('resolves deeper tailwind conflicts', () => {
    expect(cn('p-4', 'px-2')).toBe('p-4 px-2');
  });

  it('returns empty string for no inputs', () => {
    expect(cn()).toBe('');
  });

  it('handles mixed string, array, and object inputs', () => {
    expect(cn('a', ['b', 'c'], { d: true, e: false })).toBe('a b c d');
  });
});
