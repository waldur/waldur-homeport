import { TrashIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  marketplaceCustomerServiceAccountsDestroy,
  marketplaceProjectServiceAccountsDestroy,
} from 'waldur-js-client';

import { translate, formatJsxTemplate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const ServiceAccountDeleteAction = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const [removing, setRemoving] = useState(false);

  const openDialog = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete the {name} service account?',
          { name: <strong>{row.name || row.username || row.uuid}</strong> },
          formatJsxTemplate,
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    setRemoving(true);
    try {
      if ('project' in row) {
        await marketplaceProjectServiceAccountsDestroy({
          path: { uuid: row.uuid },
        });
      } else {
        await marketplaceCustomerServiceAccountsDestroy({
          path: { uuid: row.uuid },
        });
      }
      dispatch(showSuccess(translate('Service account has been deleted.')));
      refetch();
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to delete service account.')),
      );
    } finally {
      setRemoving(false);
    }
  }, [dispatch, setRemoving, row, refetch]);

  return (
    <ActionItem
      action={openDialog}
      title={translate('Delete')}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
      iconColor="danger"
      disabled={removing}
    />
  );
};
