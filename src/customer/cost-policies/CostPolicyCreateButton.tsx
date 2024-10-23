import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { Customer, Project } from '@waldur/workspace/types';

import { createOrganizationCostPolicy, createProjectCostPolicy } from './api';
import { CostPolicyFormData, CostPolicyType } from './types';

const CostPolicyFormDialog = lazyComponent(
  () => import('./CostPolicyFormDialog'),
  'CostPolicyFormDialog',
);

interface SubmitedFormData {
  scope: (Project | Customer)[];
  actions: { value; label };
  limit_cost: number;
}

const submit = (formData: SubmitedFormData, type: CostPolicyType) => {
  const promises = formData.scope.map((scope) => {
    const data: CostPolicyFormData = {
      scope: scope.url,
      actions: formData.actions.value,
      limit_cost: formData.limit_cost,
    };
    if (type === 'project') {
      return createProjectCostPolicy(data);
    }
    return createOrganizationCostPolicy(data);
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
  const dispatch = useDispatch();
  const openCostPolicyFormDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(CostPolicyFormDialog, {
          size: 'lg',
          formId: 'CostPolicyCreateForm',
          onSubmit: (formData) => {
            return submit(formData, type).then(() => {
              dispatch(closeModalDialog());
              refetch();
            });
          },
          type,
        }),
      ),
    [dispatch],
  );

  return <AddButton action={openCostPolicyFormDialog} />;
};
