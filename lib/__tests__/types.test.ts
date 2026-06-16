import { describe, it, expect } from 'vitest';
import {
  getTier,
  getNextTier,
  POINTS_PER_DOLLAR,
  REDEMPTION_RATE,
  SUBSCRIPTION_DISCOUNT,
} from '@/lib/types';

describe('getTier()', () => {
  it('returns Bronze for 0 points', () => {
    expect(getTier(0).name).toBe('Bronze');
  });

  it('returns Bronze for 499 points', () => {
    expect(getTier(499).name).toBe('Bronze');
  });

  it('returns Silver for 500 points', () => {
    expect(getTier(500).name).toBe('Silver');
  });

  it('returns Silver for 1499 points', () => {
    expect(getTier(1499).name).toBe('Silver');
  });

  it('returns Gold for 1500 points', () => {
    expect(getTier(1500).name).toBe('Gold');
  });

  it('returns Gold for points above 1500', () => {
    expect(getTier(5000).name).toBe('Gold');
  });
});

describe('getNextTier()', () => {
  it('returns Silver from Bronze', () => {
    expect(getNextTier(0)?.name).toBe('Silver');
  });

  it('returns Gold from Silver', () => {
    expect(getNextTier(500)?.name).toBe('Gold');
  });

  it('returns null at Gold', () => {
    expect(getNextTier(1500)).toBeNull();
  });
});

describe('constants', () => {
  it('POINTS_PER_DOLLAR is 1', () => {
    expect(POINTS_PER_DOLLAR).toBe(1);
  });

  it('REDEMPTION_RATE is 100', () => {
    expect(REDEMPTION_RATE).toBe(100);
  });

  it('SUBSCRIPTION_DISCOUNT is 0.15', () => {
    expect(SUBSCRIPTION_DISCOUNT).toBe(0.15);
  });
});
