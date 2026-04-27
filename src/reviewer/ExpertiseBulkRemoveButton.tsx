import { TrashIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  nestedReviewerProfileExpertiseDestroy,
  ReviewerExpertise,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { useNotify } from '@/store/hooks';
import { ActionButton } from '@/table/ActionButton';

interface OwnProps {
  rows: ReviewerExpertise[];
  refetch(): void;
  profile: { uuid: string };
}

export const ExpertiseBulkRemoveButton = ({
  rows,
  refetch,
  profile,
}: OwnProps) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const { showSuccess, showErrorResponse } = useNotify();
  const dispatch = useDispatch();

  const callback = async () => {
    try {
      const itemsList = rows.map((row) => (
        <li key={row.uuid}>{row.expertise_keyword}</li>
      ));

      const formattedMessage = (
        <div>
          <p>
            {translate('You are about to remove these expertise keywords:')}
          </p>
          <ul>{itemsList}</ul>
        </div>
      );

      await waitForConfirmation(
        dispatch,
        translate('Remove selected expertise'),
        formattedMessage,
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      setIsRemoving(true);
      const promises = rows.map((row) =>
        nestedReviewerProfileExpertiseDestroy({
          path: {
            reviewer_profile_uuid: profile.uuid,
            uuid: row.uuid,
          },
        }),
      );

      await Promise.allSettled(promises).then((results) => {
        const errors = results.filter((res) => res.status === 'rejected');
        const success = results.filter((res) => res.status === 'fulfilled');

        if (errors.length) {
          if (success.length) {
            showSuccess(
              translate('{n} expertise keywords have been removed.', {
                n: success.length,
              }),
            );
          }
          showErrorResponse(
            (errors[0] as PromiseRejectedResult).reason,
            translate('Some expertise keywords could not be removed.'),
          );
        } else {
          showSuccess(
            translate(
              'Selected expertise keywords have been successfully removed.',
            ),
          );
        }
      });
      refetch();
    } catch (e) {
      showErrorResponse(e, translate('Unable to remove expertise keywords.'));
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <ActionButton
      title={translate('Remove')}
      action={callback}
      iconNode={<TrashIcon weight="bold" />}
      variant="danger"
      disabled={isRemoving}
      disabledReason={translate('Removal in progress')}
    />
  );
};
