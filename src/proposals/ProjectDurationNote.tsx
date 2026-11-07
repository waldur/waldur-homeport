import { FC } from 'react';

import { PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';

import { useCallFixedDuration } from './callQueries';
import { getLongestPrepaidMonths } from './prepaidDuration';
import { usesCallVocabulary } from './presentation';
import {
  formatProjectDuration,
  getProjectDuration,
  ProjectDuration,
} from './projectDuration';
import { useProposalResourceRows } from './useProposalResourceRows';

/**
 * The length the awarded project will have, from the same inputs allocation
 * reads: the call's fixed duration, else the length chosen from the call's
 * list, else the longest subscription requested. Both queries are shared with
 * the summary panel, so no extra requests.
 */
export const useProjectDuration = (proposal: {
  uuid: string;
  call_uuid?: string;
  requested_duration_months?: number | null;
}): ProjectDuration => {
  const { data: rows } = useProposalResourceRows(proposal.uuid);
  const fixedDays = useCallFixedDuration(proposal.call_uuid);
  return getProjectDuration(
    getLongestPrepaidMonths(rows),
    fixedDays,
    proposal.requested_duration_months,
  );
};

/**
 * Why the figure is what it is — said only when the applicant's own choices
 * set it. A fixed duration needs no explanation here: the call page states
 * the policy, and the period selector only offers lengths that fit inside it.
 */
const projectDurationHint = (
  duration: ProjectDuration,
  chosen?: boolean,
): string => {
  if (!duration || !('months' in duration)) {
    return '';
  }
  if (chosen) {
    return translate("Chosen from the call's options.");
  }
  return usesCallVocabulary()
    ? translate('Set by the longest subscription requested.')
    : translate(
        'Your access lasts as long as the longest subscription requested.',
      );
};

/**
 * A fact on the Details overview card: the length beside the deadline and the
 * other things about the award the applicant does not decide.
 */
export const ProjectDurationNote: FC<{
  duration: ProjectDuration;
  /** The length was chosen from the call's list rather than derived. */
  chosen?: boolean;
}> = ({ duration, chosen }) => {
  if (!duration) {
    return null;
  }
  const hint = projectDurationHint(duration, chosen);
  return (
    <PropertyItem
      label={translate('Project duration')}
      value={
        <>
          {formatProjectDuration(duration)}
          {hint && (
            <span className="text-quaternary ms-1.5 text-xs">{hint}</span>
          )}
        </>
      }
    />
  );
};
