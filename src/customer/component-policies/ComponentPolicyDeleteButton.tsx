import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { marketplaceCustomerComponentUsagePoliciesDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

export const ComponentPolicyDeleteButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete the component usage policy?',
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    await marketplaceCustomerComponentUsagePoliciesDestroy({
      path: { uuid: row.uuid },
    });
    refetch();
  };
  return (
    <ActionItem
      title={translate('Remove')}
      action={openDialog}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
      iconColor="danger"
    />
  );
};
