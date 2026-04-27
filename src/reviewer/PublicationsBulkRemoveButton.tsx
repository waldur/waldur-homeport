import { TrashIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  nestedReviewerProfilePublicationsDestroy,
  ReviewerPublication,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { useNotify } from '@/store/hooks';
import { ActionButton } from '@/table/ActionButton';

interface OwnProps {
  rows: ReviewerPublication[];
  refetch(): void;
  profile: { uuid: string };
}

export const PublicationsBulkRemoveButton = ({
  rows,
  refetch,
  profile,
}: OwnProps) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const { showSuccess, showErrorResponse } = useNotify();
  const dispatch = useDispatch();

  const callback = async () => {
    try {
      const itemsList = rows.map((row) => <li key={row.uuid}>{row.title}</li>);

      const formattedMessage = (
        <div>
          <p>{translate('You are about to remove these publications:')}</p>
          <ul>{itemsList}</ul>
        </div>
      );

      await waitForConfirmation(
        dispatch,
        translate('Remove selected publications'),
        formattedMessage,
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      setIsRemoving(true);
      const promises = rows.map((row) =>
        nestedReviewerProfilePublicationsDestroy({
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
              translate('{n} publications have been removed.', {
                n: success.length,
              }),
            );
          }
          showErrorResponse(
            (errors[0] as PromiseRejectedResult).reason,
            translate('Some publications could not be removed.'),
          );
        } else {
          showSuccess(
            translate('Selected publications have been successfully removed.'),
          );
        }
      });
      refetch();
    } catch (e) {
      showErrorResponse(e, translate('Unable to remove publications.'));
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
