import { getReadyToAssignState } from './readyToAssign';

describe('getReadyToAssignState', () => {
  it('is positive when there is money left to assign', () => {
    expect(getReadyToAssignState(1)).toBe('positive');
  });

  it('is negative when more is assigned than there is', () => {
    expect(getReadyToAssignState(-1)).toBe('negative');
  });

  it('is zero when everything is assigned', () => {
    expect(getReadyToAssignState(0)).toBe('zero');
  });

  it('is zero before the sheet has a value', () => {
    expect(getReadyToAssignState(null)).toBe('zero');
    expect(getReadyToAssignState(undefined)).toBe('zero');
  });
});
