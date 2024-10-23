import { PencilSimple } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { RowActionButton } from '@waldur/table/ActionButton';
import { Customer, Project } from '@waldur/workspace/types';

import { updateOrganizationCostPolicy, updateProjectCostPolicy } from './api';
import { CostPolicyFormData, CostPolicyType } from './types';
import { getCostPolicyActionOptions } from './utils';

const CostPolicyFormDialog = lazyComponent(
  () => import('./CostPolicyFormDialog'),
  'CostPolicyFormDialog',
);

interface SubmitedFormData {
  scope: (Project | Customer)[];
  actions: { value; label };
  limit_cost: number;
}

const submit = (
  uuid: string,
  formData: SubmitedFormData,
  type: CostPolicyType,
) => {
  const promises = formData.scope.map((scope) => {
    const data: CostPolicyFormData = {
      scope: scope.url,
      actions: formData.actions.value,
      limit_cost: formData.limit_cost,
    };
    if (type === 'project') {
      return updateProjectCostPolicy(uuid, data);
    }
    return updateOrganizationCostPolicy(uuid, data);
  });
  return Promise.all(promises);
};

interface CostPolicyEditButtonProps {
  row;
  refetch(): void;
  type: CostPolicyType;
}

export const CostPolicyEditButton = ({
  row,
  refetch,
  type,
}: CostPolicyEditButtonProps) => {
  const dispatch = useDispatch();
  const openCostPolicyEditDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(CostPolicyFormDialog, {
          size: 'lg',
          formId: 'CostPolicyEditForm',
          onSubmit: (formData) => {
            return submit(row.uuid, formData, type).then(() => {
              dispatch(closeModalDialog());
              refetch();
            });
          },
          type,
          initialValues: {
            scope: [
              {
                name: row.scope_name,
                uuid: row.scope_uuid,
                url: row.scope,
                ...(type === 'project'
                  ? { billing_price_estimate: row.billing_price_estimate }
                  : {}),
              },
            ],
            actions: getCostPolicyActionOptions(type).find(
              (option) => option.value === row.actions,
            ),
            limit_cost: row.limit_cost,
          },
        }),
      ),
    [dispatch],
  );

  return (
    <RowActionButton
      title={translate('Edit')}
      action={openCostPolicyEditDialog}
      iconNode={<PencilSimple />}
      size="sm"
    />
  );
};
