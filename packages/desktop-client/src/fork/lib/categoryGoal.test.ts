import {
  acceptsTargets,
  parseGoalDef,
  resolveCategoryGoal,
} from './categoryGoal';

describe('parseGoalDef', () => {
  it('reads stored templates', () => {
    const templates = [{ type: 'simple', monthly: 50, directive: 'template' }];
    expect(parseGoalDef(JSON.stringify(templates))).toEqual(templates);
  });

  it('treats missing or unreadable definitions as no templates', () => {
    expect(parseGoalDef(undefined)).toEqual([]);
    expect(parseGoalDef('')).toEqual([]);
    expect(parseGoalDef('{not json')).toEqual([]);
    expect(parseGoalDef('{"type":"simple"}')).toEqual([]);
  });
});

describe('acceptsTargets', () => {
  it('skips income categories in envelope budgets only', () => {
    expect(acceptsTargets({ is_income: true }, 'envelope')).toBe(false);
    expect(acceptsTargets({ is_income: true }, 'tracking')).toBe(true);
    expect(acceptsTargets({ is_income: false }, 'envelope')).toBe(true);
  });
});

describe('resolveCategoryGoal', () => {
  const projected = { goal: 5000, longGoal: null } as const;

  it('prefers the target stored for the month', () => {
    const stored = { goal: 3000, longGoal: 1 } as const;
    expect(resolveCategoryGoal(stored, projected)).toBe(stored);
  });

  it('keeps a stored target of zero', () => {
    const stored = { goal: 0, longGoal: null } as const;
    expect(resolveCategoryGoal(stored, projected)).toBe(stored);
  });

  it('falls back to the projection when the month has none', () => {
    const stored = { goal: null, longGoal: null } as const;
    expect(resolveCategoryGoal(stored, projected)).toBe(projected);
    expect(resolveCategoryGoal(stored, null)).toBe(stored);
  });
});
