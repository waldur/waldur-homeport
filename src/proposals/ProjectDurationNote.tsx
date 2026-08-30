import { FC } from 'react';

import { translate } from '@/i18n';
import { Field } from '@/resource/summary';

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
 * reads: the longest subscription requested, else the call's fixed duration.
 * Both queries are shared with the summary panel, so no extra requests.
 */
export const useProjectDuration = (proposal: {
  uuid: string;
  call_uuid?: string;
}): ProjectDuration => {
  const { data: rows } = useProposalResourceRows(proposal.uuid);
  const fixedDays = useCallFixedDuration(proposal.call_uuid);
  return getProjectDuration(getLongestPrepaidMonths(rows), fixedDays);
};

/**
 * Why the figure is what it is — said only when the applicant's own choices
 * set it. A fixed duration needs no explanation here: the call page states
 * the policy, and the period selector only offers lengths that fit inside it.
 */
const projectDurationHint = (duration: ProjectDuration): string => {
  if (!duration || !('months' in duration)) {
    return '';
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
export const ProjectDurationNote: FC<{ duration: ProjectDuration }> = ({
  duration,
}) => {
  if (!duration) {
    return null;
  }
  const hint = projectDurationHint(duration);
  return (
    <Field
      label={translate('Project duration')}
      value={
        <>
          {formatProjectDuration(duration)}
          {hint && <span className="text-muted ms-2 fs-7">{hint}</span>}
        </>
      }
      labelCol={5}
      valueCol={7}
    />
  );
};
