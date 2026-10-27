import {
  OptionSummaryItem,
  summarizeOptionValues,
} from '@/marketplace/common/optionSummary';
import {
  MissingOption,
  missingRequiredOptions,
  OfferingOptionsLike,
} from '@/marketplace/common/requiredOptions';
import { PREPAID_DURATION_MONTHS } from '@/proposals/prepaidDuration';
import { hasRequestedAmount } from '@/proposals/requestedResourceCost';

interface RequestedResourceLike {
  requested_offering?: { options?: OfferingOptionsLike | null } | null;
  attributes?: Record<string, unknown> | null;
}

/**
 * The required options of the row's offering the request does not answer.
 *
 * Shared by the proposal's completion check and the resource requests table,
 * so the step is not ticked while a row still says what it lacks. The backend
 * refuses to submit such a request.
 */
export const getMissingRequestOptions = (
  row: RequestedResourceLike,
): MissingOption[] =>
  missingRequiredOptions(row?.requested_offering?.options, row?.attributes);

/**
 * The options the request answers, as label and plain-text value. The
 * subscription period is left out: it is shown on its own, as the Period.
 */
export const getRequestOptionSummary = (
  row: RequestedResourceLike,
): OptionSummaryItem[] =>
  summarizeOptionValues(
    row?.requested_offering?.options,
    row?.attributes,
  ).filter((item) => item.key !== PREPAID_DURATION_MONTHS);

/**
 * Whether a request is ready to submit: it names an amount, and answers every
 * required option of its offering. The proposal's Resource requests step is
 * ticked only when each of its rows is.
 */
export const isRequestComplete = (
  row: RequestedResourceLike & Parameters<typeof hasRequestedAmount>[0],
): boolean =>
  hasRequestedAmount(row) && getMissingRequestOptions(row).length === 0;
