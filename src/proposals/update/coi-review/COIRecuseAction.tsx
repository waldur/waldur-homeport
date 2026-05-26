import { UserMinusIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import {
  ConflictOfInterest,
  conflictsOfInterestRecuse,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

interface COIRecuseActionProps {
  row: ConflictOfInterest;
  fetch: () => void;
}

export const COIRecuseAction: FC<COIRecuseActionProps> = ({ row, fetch }) => {
  const { mutate: handleRecuse, isPending } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () =>
      conflictsOfInterestRecuse({
        path: { uuid: row.uuid },
        body: { status: 'recused' },
      }),
    successMessage: translate('Reviewer recused from proposal.'),
    errorMessage: translate('Failed to recuse reviewer.'),
    refetch: fetch,
    confirmation: {
      title: translate('Recuse reviewer'),
      body: (
        <div>
          <p>
            {translate(
              'You are about to remove this reviewer from reviewing the proposal.',
            )}
          </p>
          <div className="bg-light-danger rounded p-3 mb-3">
            <strong className="d-block mb-2">
              {translate('What happens next:')}
            </strong>
            <ul className="mb-0 ps-3">
              <li>
                {translate(
                  'The reviewer will be permanently removed from this proposal.',
                )}
              </li>
              <li>
                {translate(
                  'Any existing review or scores from this reviewer will be discarded.',
                )}
              </li>
              <li>
                {translate(
                  'You may need to assign a replacement reviewer to maintain review coverage.',
                )}
              </li>
            </ul>
          </div>
          <div className="text-muted small">
            <strong>{translate('Reviewer')}:</strong> {row.reviewer_name}
            <br />
            <strong>{translate('Proposal')}:</strong> {row.proposal_name}
            <br />
            <strong>{translate('Conflict type')}:</strong>{' '}
            {row.coi_type_display}
          </div>
        </div>
      ),
      options: {
        positiveButton: translate('Recuse reviewer'),
        positiveButtonVariant: 'danger',
        type: 'danger',
      },
    },
  });

  return (
    <ActionItem
      title={isPending ? translate('Recusing...') : translate('Recuse')}
      action={() => handleRecuse()}
      iconNode={<UserMinusIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
      disabled={isPending}
    />
  );
};
