import { getCategoryTarget } from './targetProgress';
import {
  getAssignableShortfall,
  summarizeShortfalls,
  withShortfall,
} from './underfunded';

describe('getAssignableShortfall', () => {
  it('counts what a monthly target still needs', () => {
    expect(getAssignableShortfall(getCategoryTarget(5000, 2000, false))).toBe(
      3000,
    );
  });

  it('counts nothing for a funded target, a long goal or none', () => {
    expect(getAssignableShortfall(getCategoryTarget(5000, 6000, false))).toBe(
      0,
    );
    expect(getAssignableShortfall(getCategoryTarget(5000, 0, true))).toBe(0);
    expect(getAssignableShortfall(null)).toBe(0);
  });
});

describe('summarizeShortfalls', () => {
  it('adds up the categories still short', () => {
    expect(summarizeShortfalls({ a: 1000, b: 250 })).toEqual({
      categoryIds: ['a', 'b'],
      total: 1250,
    });
    expect(summarizeShortfalls({})).toEqual({ categoryIds: [], total: 0 });
  });
});

describe('withShortfall', () => {
  it('records, updates and removes a category', () => {
    const one = withShortfall({}, 'a', 1000);
    expect(one).toEqual({ a: 1000 });
    expect(withShortfall(one, 'a', 500)).toEqual({ a: 500 });
    expect(withShortfall(one, 'a', 0)).toEqual({});
    expect(withShortfall(one, 'a', null)).toEqual({});
  });

  it('keeps the same object when nothing changes', () => {
    const one = { a: 1000 };
    expect(withShortfall(one, 'a', 1000)).toBe(one);
    expect(withShortfall(one, 'b', 0)).toBe(one);
  });
});
