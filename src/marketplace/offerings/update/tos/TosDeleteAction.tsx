import { TrashIcon } from '@phosphor-icons/react';
import { truncate } from 'lodash-es';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceOfferingTermsOfServiceDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showSuccess, showErrorResponse } from '@/store/notify';

export const TosDeleteAction = ({ row, refetch }) => {
  const dispatch = useDispatch();

  const callback = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Delete ToS'),
        translate(
          'You are going to delete {tosName}. This action is irreversible. The ToS will be permanently removed.',
          {
            tosName:
              row.version || truncate(row.terms_of_service, { length: 50 }),
          },
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }

    try {
      await marketplaceOfferingTermsOfServiceDestroy({
        path: { uuid: row.uuid },
      });
      await refetch();
      dispatch(
        showSuccess(
          translate('Terms of Service has been deleted successfully.'),
        ),
      );
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to delete Terms of Service.'),
        ),
      );
    }
  }, [dispatch, row.uuid, row.version, row.terms_of_service, refetch]);

  return (
    <ActionItem
      title={translate('Delete')}
      action={callback}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
      iconColor="danger"
    />
  );
};
