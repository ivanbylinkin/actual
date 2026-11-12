import * as monthUtils from '@actual-app/core/shared/months';
import type { CategoryEntity } from '@actual-app/core/types/models';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SheetNameProvider } from '#hooks/useSheetName';
import {
  configureTestAppStore,
  createTestQueryClient,
  TestProviders,
} from '#mocks';

import { InspectorQuickAssign } from './InspectorQuickAssign';

vi.mock(
  '@actual-app/core/platform/client/connection',
  () => import('#mocks/connection'),
);

// Cells by "sheet!field". Earlier months are read through the spreadsheet,
// the inspected month through `useSheetValue`.
let cells: Record<string, number> = {};
let loadedSheets: string[] | 'all' = 'all';

vi.mock('#hooks/useSpreadsheet', () => {
  // One stable object, like the real spreadsheet context value
  const spreadsheet = {
    bind: (
      sheetName: string,
      field: string,
      callback: (node: { name: string; value: number }) => void,
    ) => {
      const name = `${sheetName}!${field}`;
      if (loadedSheets === 'all' || loadedSheets.includes(sheetName)) {
        callback({ name, value: cells[name] ?? 0 });
      }
      return () => undefined;
    },
  };
  return { useSpreadsheet: () => spreadsheet };
});

vi.mock('#hooks/useSheetValue', () => ({
  useSheetValue: (binding: string | { name: string }) => {
    const field = typeof binding === 'string' ? binding : binding.name;
    return cells[`${sheetFor(month)}!${field}`] ?? null;
  },
}));

// The tests run on a fixed clock, so the months are taken from it rather
// than written out: the inspected month is the current one
const month = monthUtils.currentMonth();
const lastMonth = monthUtils.prevMonth(month);
const twoMonthsAgo = monthUtils.subMonths(month, 2);
const threeMonthsAgo = monthUtils.subMonths(month, 3);

function sheetFor(someMonth: string) {
  return monthUtils.sheetForMonth(someMonth);
}

const category: CategoryEntity = {
  id: 'food',
  name: 'Food',
  group: 'usual',
  is_income: false,
};

function renderQuickAssign() {
  const onBudgetAction =
    vi.fn<(month: string, action: string, args?: unknown) => void>();
  const client = createTestQueryClient();
  const store = configureTestAppStore({ queryClient: client });
  render(
    <TestProviders queryClient={client} store={store}>
      <SheetNameProvider name={sheetFor(month)}>
        <InspectorQuickAssign
          category={category}
          month={month}
          onBudgetAction={onBudgetAction}
        />
      </SheetNameProvider>
    </TestProviders>,
  );
  return { onBudgetAction };
}

describe('InspectorQuickAssign', () => {
  beforeEach(() => {
    loadedSheets = 'all';
    cells = {
      // Last month: assigned 400.00, spent 555.17
      [`${sheetFor(lastMonth)}!budget-food`]: 40000,
      [`${sheetFor(lastMonth)}!sum-amount-food`]: -55517,
      // The month before: assigned 350.00
      [`${sheetFor(twoMonthsAgo)}!budget-food`]: 35000,
      // The month before that: assigned nothing
      [`${sheetFor(threeMonthsAgo)}!budget-food`]: 0,
    };
  });

  it("shows last month's assigned and spent amounts and the 3-month average", () => {
    renderQuickAssign();

    expect(
      screen.getByRole('button', { name: /Assigned last month/ }),
    ).toHaveTextContent('400.00');
    expect(
      screen.getByRole('button', { name: /Spent last month/ }),
    ).toHaveTextContent('555.17');
    expect(
      screen.getByRole('button', { name: /Average assigned/ }),
    ).toHaveTextContent('250.00');
  });

  it("copies last month's assigned amount with Actual's own action", async () => {
    const { onBudgetAction } = renderQuickAssign();

    await userEvent.click(
      screen.getByRole('button', { name: /Assigned last month/ }),
    );

    expect(onBudgetAction).toHaveBeenCalledWith(month, 'copy-single-last', {
      category: 'food',
    });
  });

  it('assigns what was spent last month', async () => {
    const { onBudgetAction } = renderQuickAssign();

    await userEvent.click(
      screen.getByRole('button', { name: /Spent last month/ }),
    );

    expect(onBudgetAction).toHaveBeenCalledWith(month, 'budget-amount', {
      category: 'food',
      amount: 55517,
    });
  });

  it('assigns the average assigned over the last three months', async () => {
    const { onBudgetAction } = renderQuickAssign();

    await userEvent.click(
      screen.getByRole('button', { name: /Average assigned/ }),
    );

    expect(onBudgetAction).toHaveBeenCalledWith(month, 'budget-amount', {
      category: 'food',
      amount: 25000,
    });
  });

  it("sets the average spent with Actual's own action", async () => {
    const { onBudgetAction } = renderQuickAssign();

    await userEvent.click(
      screen.getByRole('button', { name: /Average spent/ }),
    );

    expect(onBudgetAction).toHaveBeenCalledWith(month, 'set-single-3-avg', {
      category: 'food',
    });
  });

  it('cannot assign an amount that has not loaded yet', async () => {
    // Only last month has loaded, so the average is not known
    loadedSheets = [sheetFor(lastMonth)];
    const { onBudgetAction } = renderQuickAssign();

    const averageAssigned = screen.getByRole('button', {
      name: /Average assigned/,
    });
    expect(averageAssigned).toBeDisabled();
    await userEvent.click(averageAssigned);

    expect(onBudgetAction).not.toHaveBeenCalled();
  });

  it('offers to fund the target only while it is underfunded', () => {
    cells[`${sheetFor(month)}!goal-food`] = 65000;
    cells[`${sheetFor(month)}!budget-food`] = 40000;
    const { onBudgetAction } = renderQuickAssign();
    expect(
      screen.getByRole('button', { name: /Fund the target/ }),
    ).toHaveTextContent('650.00');
    expect(onBudgetAction).not.toHaveBeenCalled();
  });

  it('does not offer to fund a target that is already met', () => {
    cells[`${sheetFor(month)}!goal-food`] = 65000;
    cells[`${sheetFor(month)}!budget-food`] = 65000;
    renderQuickAssign();

    expect(
      screen.queryByRole('button', { name: /Fund the target/ }),
    ).not.toBeInTheDocument();
  });
});
