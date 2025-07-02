import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import {
  marketplaceCustomerEstimatedCostPoliciesDestroy,
  marketplaceProjectEstimatedCostPoliciesDestroy,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

import { CostPolicyType } from './types';

export const CostPolicyDeleteButton = ({
  row,
  refetch,
  type,
}: {
  row;
  refetch;
  type: CostPolicyType;
}) => {
  const dispatch = useDispatch();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        type === 'project'
          ? translate(
              'Are you sure you want to delete the cost policy for project {name}?',
              { name: <strong>{row.scope_name}</strong> },
              formatJsxTemplate,
            )
          : translate(
              'Are you sure you want to delete the cost policy for organization {name}?',
              { name: <strong>{row.scope_name}</strong> },
              formatJsxTemplate,
            ),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    if (type === 'project') {
      await marketplaceProjectEstimatedCostPoliciesDestroy({
        path: { uuid: row.uuid },
      });
      refetch();
    } else {
      await marketplaceCustomerEstimatedCostPoliciesDestroy({
        path: { uuid: row.uuid },
      });
      refetch();
    }
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
