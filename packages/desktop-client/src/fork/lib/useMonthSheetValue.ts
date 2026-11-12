import { useEffect, useState } from 'react';

import * as monthUtils from '@actual-app/core/shared/months';

import { useSpreadsheet } from '#hooks/useSpreadsheet';
import type { SheetFields } from '#spreadsheet';

/**
 * A numeric budget cell from a given month's sheet, kept up to date, or null
 * until it has loaded.
 *
 * `useSheetValue` only reads the sheet of the surrounding `SheetNameProvider`,
 * so reading other months (last month, the months an average covers) binds
 * to the spreadsheet directly, the same way that hook does underneath.
 */
export function useMonthSheetValue(
  month: string,
  field: SheetFields<'envelope-budget'>,
): number | null {
  const spreadsheet = useSpreadsheet();
  const cellName = `${monthUtils.sheetForMonth(month)}!${field}`;
  const [cell, setCell] = useState<{ name: string; value: number } | null>(
    null,
  );

  useEffect(() => {
    return spreadsheet.bind(monthUtils.sheetForMonth(month), field, node => {
      const value = typeof node.value === 'number' ? node.value : 0;
      // Keep the same state object when nothing changed, so a repeated
      // callback doesn't cause another render
      setCell(current =>
        current?.name === cellName && current.value === value
          ? current
          : { name: cellName, value },
      );
    });
  }, [spreadsheet, month, field, cellName]);

  // A value held over from another category or month is not this cell's
  return cell?.name === cellName ? cell.value : null;
}
