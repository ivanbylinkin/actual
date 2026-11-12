import { getAvailableState } from './availableState';

describe('getAvailableState', () => {
  it('is funded when there is money and no target', () => {
    expect(getAvailableState(5000, null, 5000)).toBe('funded');
  });

  it('is zero when the balance is empty and there is no target', () => {
    expect(getAvailableState(0, null, 0)).toBe('zero');
  });

  it('is overspent when the balance is negative', () => {
    expect(getAvailableState(-100, null, 0)).toBe('overspent');
  });

  it('is underfunded when the target is not met', () => {
    expect(getAvailableState(4000, 6500, 4000)).toBe('underfunded');
  });

  it('is underfunded with an empty balance and an unmet target', () => {
    expect(getAvailableState(0, 6500, 0)).toBe('underfunded');
  });

  it('is funded once the target is met', () => {
    expect(getAvailableState(6500, 6500, 6500)).toBe('funded');
  });

  it('is zero when the target is met and the money is spent', () => {
    expect(getAvailableState(0, 6500, 6500)).toBe('zero');
  });

  it('puts overspending ahead of an unmet target', () => {
    expect(getAvailableState(-100, 6500, 1000)).toBe('overspent');
  });

  it('treats a missing balance as zero', () => {
    expect(getAvailableState(null, null, null)).toBe('zero');
  });

  it('compares amounts as displayed when decimals are hidden', () => {
    // 0.40 shows as 0 and 64.60 shows as 65, matching a target of 65
    expect(getAvailableState(40, null, 40, 0)).toBe('zero');
    expect(getAvailableState(6460, 6500, 6460, 0)).toBe('funded');
    expect(getAvailableState(-40, null, 0, 0)).toBe('zero');
  });
});
