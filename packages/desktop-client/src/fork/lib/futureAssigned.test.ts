import {
  getFutureAssignedDeduction,
  getFutureMonths,
  monthFromSheetName,
  sumAssigned,
} from './futureAssigned';

describe('monthFromSheetName', () => {
  it('reads the month from a budget sheet name', () => {
    expect(monthFromSheetName('budget202611')).toBe('2026-11');
  });

  it('is null for any other sheet', () => {
    expect(monthFromSheetName('__global')).toBeNull();
    expect(monthFromSheetName('budget2026')).toBeNull();
  });
});

describe('getFutureMonths', () => {
  it('takes every month after the current month up to the last one', () => {
    expect(getFutureMonths('2026-11', '2026-11', '2027-02')).toEqual([
      '2026-12',
      '2027-01',
      '2027-02',
    ]);
  });

  it('starts after the displayed month when it is in the future', () => {
    expect(getFutureMonths('2027-01', '2026-11', '2027-02')).toEqual([
      '2027-02',
    ]);
  });

  it('has none for the last month of the budget', () => {
    expect(getFutureMonths('2027-02', '2026-11', '2027-02')).toEqual([]);
  });

  it('has none for a past month', () => {
    expect(getFutureMonths('2026-10', '2026-11', '2027-02')).toEqual([]);
  });
});

describe('sumAssigned', () => {
  it('turns the negated total-budgeted cells into a positive amount', () => {
    // $500 assigned in one month and $250 in another
    expect(sumAssigned([-50000, -25000])).toBe(75000);
  });

  it('is zero with no months', () => {
    expect(sumAssigned([])).toBe(0);
  });

  it('nets an unassignment against other months', () => {
    expect(sumAssigned([-50000, 20000])).toBe(30000);
  });
});

describe('getFutureAssignedDeduction', () => {
  it('takes the whole future amount off when nothing is held', () => {
    expect(getFutureAssignedDeduction(50000, 0)).toBe(50000);
  });

  it('lets future assignments use the money held for next month first', () => {
    expect(getFutureAssignedDeduction(50000, 20000)).toBe(30000);
    expect(getFutureAssignedDeduction(50000, 80000)).toBe(0);
  });

  it('never adds a future unassignment to this month', () => {
    expect(getFutureAssignedDeduction(-30000, 0)).toBe(0);
  });

  it('ignores a negative hold', () => {
    expect(getFutureAssignedDeduction(50000, -10000)).toBe(50000);
  });
});
