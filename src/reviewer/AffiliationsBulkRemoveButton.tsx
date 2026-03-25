import { TrashIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  nestedReviewerProfileAffiliationsDestroy,
  ReviewerAffiliation,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { useNotify } from '@waldur/store/hooks';
import { ActionButton } from '@waldur/table/ActionButton';

interface OwnProps {
  rows: ReviewerAffiliation[];
  refetch(): void;
  profile: { uuid: string };
}

export const AffiliationsBulkRemoveButton = ({
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
        <li key={row.uuid}>
          {row.organization_name_display}
          {row.position_title && ` - ${row.position_title}`}
        </li>
      ));

      const formattedMessage = (
        <div>
          <p>{translate('You are about to remove these affiliations:')}</p>
          <ul>{itemsList}</ul>
        </div>
      );

      await waitForConfirmation(
        dispatch,
        translate('Remove selected affiliations'),
        formattedMessage,
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      setIsRemoving(true);
      const promises = rows.map((row) =>
        nestedReviewerProfileAffiliationsDestroy({
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
              translate('{n} affiliations have been removed.', {
                n: success.length,
              }),
            );
          }
          showErrorResponse(
            (errors[0] as PromiseRejectedResult).reason,
            translate('Some affiliations could not be removed.'),
          );
        } else {
          showSuccess(
            translate('Selected affiliations have been successfully removed.'),
          );
        }
      });
      refetch();
    } catch (e) {
      showErrorResponse(e, translate('Unable to remove affiliations.'));
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
