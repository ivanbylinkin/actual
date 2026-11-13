import {
  useEnvelopeSheetName,
  useEnvelopeSheetValue,
} from '#components/budget/envelope/EnvelopeBudgetComponents';
import {
  getFutureAssignedDeduction,
  monthFromSheetName,
} from '#fork/lib/futureAssigned';
import { useFutureAssigned } from '#fork/lib/useFutureAssigned';
import { envelopeBudget } from '#spreadsheet/bindings';

/**
 * Ready to Assign for the month of the surrounding `SheetNameProvider`, as
 * YNAB shows it: Actual's `to-budget` less what later months have already
 * assigned (`assignedInFuture`, a positive amount, zero when there is none).
 *
 * `cellName` is the `to-budget` cell the amount starts from. While the later
 * months load, the amount is `to-budget` as it stands.
 */
export function useReadyToAssign() {
  const { fullSheetName: cellName, sheetName } = useEnvelopeSheetName(
    envelopeBudget.toBudget,
  );
  const toBudget = useEnvelopeSheetValue(envelopeBudget.toBudget) ?? 0;
  const heldForNextMonth =
    useEnvelopeSheetValue(envelopeBudget.forNextMonth) ?? 0;
  const futureAssigned = useFutureAssigned(monthFromSheetName(sheetName));
  const assignedInFuture = getFutureAssignedDeduction(
    futureAssigned ?? 0,
    heldForNextMonth,
  );

  return {
    amount: toBudget - assignedInFuture,
    assignedInFuture,
    cellName,
  };
}
