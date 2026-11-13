import {
  getAdjacentVisibleMonth,
  getInspectedMonth,
  getVisibleMonths,
} from './inspectorMonth';

describe('getVisibleMonths', () => {
  const bounds = { start: '2026-01', end: '2026-12' };

  it('lists the months on screen', () => {
    expect(getVisibleMonths('2026-10', 3, bounds)).toEqual([
      '2026-10',
      '2026-11',
      '2026-12',
    ]);
  });

  it('stops at the end of the budget', () => {
    expect(getVisibleMonths('2026-11', 3, bounds)).toEqual([
      '2026-11',
      '2026-12',
    ]);
  });

  it('starts at the start of the budget', () => {
    expect(getVisibleMonths('2025-12', 2, bounds)).toEqual(['2026-01']);
  });

  it('shows nothing without months', () => {
    expect(getVisibleMonths('2026-10', 0, bounds)).toEqual([]);
  });
});

describe('getInspectedMonth', () => {
  const visible = ['2026-10', '2026-11', '2026-12'];

  it('keeps a picked month while it is on screen', () => {
    expect(getInspectedMonth('2026-12', visible, '2026-11', '2026-10')).toBe(
      '2026-12',
    );
  });

  it('prefers the current month over the first one shown', () => {
    expect(getInspectedMonth(null, visible, '2026-11', '2026-10')).toBe(
      '2026-11',
    );
    expect(getInspectedMonth('2027-01', visible, '2026-11', '2026-10')).toBe(
      '2026-11',
    );
  });

  it('uses the first month shown when the current one is not', () => {
    expect(getInspectedMonth(null, visible, '2027-03', '2026-10')).toBe(
      '2026-10',
    );
  });

  it('falls back before the table reports its months', () => {
    expect(getInspectedMonth(null, [], '2026-11', '2026-10')).toBe('2026-10');
  });
});

describe('getAdjacentVisibleMonth', () => {
  const visible = ['2026-10', '2026-11', '2026-12'];

  it('steps through the months on screen', () => {
    expect(getAdjacentVisibleMonth('2026-11', visible, -1)).toBe('2026-10');
    expect(getAdjacentVisibleMonth('2026-11', visible, 1)).toBe('2026-12');
  });

  it('stops at either end', () => {
    expect(getAdjacentVisibleMonth('2026-10', visible, -1)).toBeNull();
    expect(getAdjacentVisibleMonth('2026-12', visible, 1)).toBeNull();
    expect(getAdjacentVisibleMonth('2027-01', visible, 1)).toBeNull();
  });
});
