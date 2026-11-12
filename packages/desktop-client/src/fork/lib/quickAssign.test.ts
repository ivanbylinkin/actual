import {
  getAverageAmount,
  getAverageMonths,
  getSpentAmount,
} from './quickAssign';

describe('getAverageMonths', () => {
  it('takes the three months before the month, newest first', () => {
    expect(getAverageMonths('2026-11', '2026-11')).toEqual([
      '2026-10',
      '2026-09',
      '2026-08',
    ]);
  });

  it('crosses a year boundary', () => {
    expect(getAverageMonths('2026-02', '2026-06')).toEqual([
      '2026-01',
      '2025-12',
      '2025-11',
    ]);
  });

  it('ends before the current month when looking at a future month', () => {
    expect(getAverageMonths('2027-03', '2026-11')).toEqual([
      '2026-10',
      '2026-09',
      '2026-08',
    ]);
  });

  it('takes as many months as asked for', () => {
    expect(getAverageMonths('2026-11', '2026-11', 1)).toEqual(['2026-10']);
  });
});

describe('getAverageAmount', () => {
  it('averages the amounts', () => {
    expect(getAverageAmount([30000, 40000, 50000])).toBe(40000);
  });

  it('rounds to a whole minor unit', () => {
    expect(getAverageAmount([100, 100, 101])).toBe(100);
    expect(getAverageAmount([100, 101, 101])).toBe(101);
  });

  it('counts a month with nothing assigned', () => {
    expect(getAverageAmount([40000, 40000, 0])).toBe(26667);
  });

  it('is unknown while a month is still loading', () => {
    expect(getAverageAmount([30000, null, 20000])).toBeNull();
  });

  it('is zero for no months', () => {
    expect(getAverageAmount([])).toBe(0);
  });
});

describe('getSpentAmount', () => {
  it('turns spending into the amount to assign', () => {
    expect(getSpentAmount(-12345)).toBe(12345);
  });

  it('is zero when nothing was spent', () => {
    expect(getSpentAmount(0)).toBe(0);
  });

  it('is unknown while the activity is still loading', () => {
    expect(getSpentAmount(null)).toBeNull();
  });

  it('is zero when the month netted out as a refund', () => {
    expect(getSpentAmount(500)).toBe(0);
  });
});
