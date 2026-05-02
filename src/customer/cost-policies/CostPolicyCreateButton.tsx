import { useCallback } from 'react';
import {
  marketplaceCustomerEstimatedCostPoliciesCreate,
  MarketplaceCustomerEstimatedCostPoliciesCreateData,
  marketplaceProjectEstimatedCostPoliciesCreate,
  MarketplaceProjectEstimatedCostPoliciesCreateData,
} from 'waldur-js-client';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';

import { CostPolicyFormData, CostPolicyType } from './types';

const CostPolicyFormDialog = lazyComponent(() =>
  import('./CostPolicyFormDialog').then((module) => ({
    default: module.CostPolicyFormDialog,
  })),
);

const submit = (formData: CostPolicyFormData, type: CostPolicyType) => {
  const promises = formData.scope.map((scope) => {
    const options =
      formData.actions.value === 'notify_external_user'
        ? {
            notify_external_user: formData.options?.notify_external_user,
          }
        : {};
    const data:
      | MarketplaceProjectEstimatedCostPoliciesCreateData['body']
      | MarketplaceCustomerEstimatedCostPoliciesCreateData['body'] = {
      scope: scope.url,
      actions: formData.actions.value,
      limit_cost: formData.limit_cost,
      period: formData.period,
      options: Object.keys(options).length
        ? JSON.stringify(options)
        : undefined,
    };
    if (type === 'project') {
      return marketplaceProjectEstimatedCostPoliciesCreate({ body: data });
    }
    return marketplaceCustomerEstimatedCostPoliciesCreate({ body: data });
  });
  return Promise.all(promises);
};

interface CostPolicyCreateButtonProps {
  refetch(): void;
  type: CostPolicyType;
}

export const CostPolicyCreateButton = ({
  refetch,
  type,
}: CostPolicyCreateButtonProps) => {
  const { openDialog, closeDialog } = useModal();
  const openCostPolicyFormDialog = useCallback(
    () =>
      openDialog(CostPolicyFormDialog, {
        size: 'lg',
        formId: 'CostPolicyCreateForm',
        submitFn: (formData) => {
          return submit(formData, type).then(() => {
            closeDialog();
            refetch();
          });
        },
        type,
      }),
    [],
  );

  return <AddButton action={openCostPolicyFormDialog} />;
};
