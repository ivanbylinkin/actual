import { getCategoryTarget } from './targetProgress';

describe('getCategoryTarget', () => {
  it('reports a partly funded target', () => {
    expect(getCategoryTarget(65000, 40000, false)).toEqual({
      goal: 65000,
      have: 40000,
      progress: 61,
      isFunded: false,
      shortfall: 25000,
      isLongGoal: false,
    });
  });

  it('reports a funded target with nothing missing', () => {
    const target = getCategoryTarget(65000, 65000, false);
    expect(target.progress).toBe(100);
    expect(target.isFunded).toBe(true);
    expect(target.shortfall).toBe(0);
  });

  it('caps progress at 100 when overfunded', () => {
    const target = getCategoryTarget(65000, 90000, true);
    expect(target.progress).toBe(100);
    expect(target.isFunded).toBe(true);
    expect(target.shortfall).toBe(0);
  });

  it('stays below 100 until the target is met', () => {
    expect(getCategoryTarget(65000, 64999, false).progress).toBe(99);
  });

  it('is empty when nothing is assigned', () => {
    const target = getCategoryTarget(65000, 0, false);
    expect(target.progress).toBe(0);
    expect(target.shortfall).toBe(65000);
  });

  it('treats a zero target as funded', () => {
    expect(getCategoryTarget(0, 0, false).isFunded).toBe(true);
  });

  it('compares as displayed when decimals are hidden', () => {
    // 649.60 shows as 650, matching a target of 650
    expect(getCategoryTarget(65000, 64960, false, 0).isFunded).toBe(true);
  });
});
