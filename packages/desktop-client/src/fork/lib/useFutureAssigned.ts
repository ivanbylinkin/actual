import { useEffect, useState } from 'react';

import * as monthUtils from '@actual-app/core/shared/months';
import { useQuery } from '@tanstack/react-query';

import { budgetBoundsQueries } from '#budget';
import { getFutureMonths, sumAssigned } from '#fork/lib/futureAssigned';
import { useSpreadsheet } from '#hooks/useSpreadsheet';
import { envelopeBudget } from '#spreadsheet/bindings';

type CellValues = { key: string; values: Record<string, number> };

function cellNameFor(month: string) {
  return `${monthUtils.sheetForMonth(month)}!${envelopeBudget.totalBudgeted}`;
}

/**
 * The total assigned in every month after `month` that the budget has, as a
 * positive amount, kept up to date, or null until it has loaded. Zero for a
 * past month, whose Ready to Assign is left as Actual computes it.
 *
 * The number of later months varies, so this binds each month's
 * `total-budgeted` cell to the spreadsheet directly, as `useMonthSheetValue`
 * does for one cell.
 */
export function useFutureAssigned(month: string | null): number | null {
  const spreadsheet = useSpreadsheet();
  const { data: bounds } = useQuery(budgetBoundsQueries.bounds());
  const months =
    month && bounds
      ? getFutureMonths(month, monthUtils.currentMonth(), bounds.end)
      : null;
  const monthsKey = months ? months.join(',') : '';
  const [cells, setCells] = useState<CellValues>({ key: '', values: {} });

  useEffect(() => {
    if (!monthsKey) {
      return;
    }
    const unbinds = monthsKey.split(',').map(futureMonth => {
      const cellName = cellNameFor(futureMonth);
      return spreadsheet.bind(
        monthUtils.sheetForMonth(futureMonth),
        envelopeBudget.totalBudgeted,
        node => {
          const value = typeof node.value === 'number' ? node.value : 0;
          setCells(current => {
            const values = current.key === monthsKey ? current.values : {};
            // Keep the same state object when nothing changed, so a
            // repeated callback doesn't cause another render
            if (current.key === monthsKey && values[cellName] === value) {
              return current;
            }
            return { key: monthsKey, values: { ...values, [cellName]: value } };
          });
        },
      );
    });
    return () => unbinds.forEach(unbind => unbind());
  }, [spreadsheet, monthsKey]);

  if (!months) {
    return null;
  }
  if (months.length === 0) {
    return 0;
  }
  // Values held over from another list of months are not these months'
  if (cells.key !== monthsKey) {
    return null;
  }
  const values = months.map(
    futureMonth => cells.values[cellNameFor(futureMonth)],
  );
  if (values.some(value => value === undefined)) {
    return null;
  }
  return sumAssigned(values);
}
