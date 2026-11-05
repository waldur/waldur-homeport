import { translate } from '@/i18n';
import {
  ExistingRoleHit,
  getExistingRoleMessage,
} from '@/permissions/existingRoles';

import { findVerdictForRow, isVerdictForRow, RowVerdict } from '../rowVerdicts';

/** The verdicts Continue writes into the form values, one list per kind. */
export interface VerdictLists {
  inForm?: RowVerdict[] | '';
  pending?: RowVerdict[] | '';
  blocks?: ExistingRoleHit[] | '';
  warnings?: ExistingRoleHit[] | '';
}

export interface RowFeedback {
  message: string;
  /** Blocking feedback keeps Continue disabled; a warning only holds it once. */
  blocking: boolean;
}

export interface FlaggedRow extends RowFeedback {
  index: number;
}

/**
 * What the row list says under one row. The row message, the summary above
 * the footer and the Continue tooltip all read it from here, so they cannot
 * disagree about which rows are flagged.
 */
export const getRowFeedback = (
  row: any,
  rows: any[] | undefined,
  lists: VerdictLists,
): RowFeedback | null => {
  const inForm = findVerdictForRow(lists.inForm, row);
  if (
    inForm &&
    (rows ?? []).filter((r) => isVerdictForRow(inForm, r)).length > 1
  ) {
    return {
      message: translate(
        'This email and role combination is entered more than once.',
      ),
      blocking: true,
    };
  }
  if (findVerdictForRow(lists.pending, row)) {
    return {
      message: translate('This email already has a pending invitation.'),
      blocking: true,
    };
  }
  const block = findVerdictForRow(lists.blocks, row);
  if (block) {
    return { message: getExistingRoleMessage(block), blocking: true };
  }
  const warning = findVerdictForRow(lists.warnings, row);
  if (warning) {
    return { message: getExistingRoleMessage(warning), blocking: false };
  }
  return null;
};

export const getFlaggedRows = (
  rows: any[] | undefined,
  lists: VerdictLists,
): FlaggedRow[] =>
  (rows ?? []).flatMap((row, index) => {
    const feedback = getRowFeedback(row, rows, lists);
    return feedback ? [{ ...feedback, index }] : [];
  });

export const getVerdictLists = (values: any): VerdictLists => ({
  inForm: values?._duplicateInFormEmails,
  pending: values?._duplicateEmails,
  blocks: values?._existingRoleBlocks,
  warnings: values?._existingRoleWarnings,
});
