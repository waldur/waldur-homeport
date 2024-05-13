import { PlusCircle } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n/translate';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';
import { Project } from '@waldur/workspace/types';

import { createCostPolicy } from './api';
import { CostPolicyFormData } from './types';

const CostPolicyCreateDialog = lazyComponent(
  () => import('./CostPolicyCreateDialog'),
  'CostPolicyCreateDialog',
);

interface SubmitedFormData {
  project: Project;
  actions: { value; label };
  limit_cost: number;
}

const submit = (formData: SubmitedFormData) => {
  const data: CostPolicyFormData = {
    project: formData.project.url,
    actions: formData.actions.value,
    limit_cost: formData.limit_cost,
  };
  return createCostPolicy(data);
};

export const CostPolicyCreateButton = ({ refetch }) => {
  const dispatch = useDispatch();
  const openCostPolicyCreateDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(CostPolicyCreateDialog, {
          size: 'lg',
          onSubmit: (formData) => {
            return submit(formData).then(() => {
              dispatch(closeModalDialog());
              refetch();
            });
          },
          onCancel: () => {
            dispatch(closeModalDialog());
          },
        }),
      ),
    [dispatch],
  );

  return (
    <ActionButton
      title={translate('New policy')}
      iconNode={<PlusCircle />}
      action={openCostPolicyCreateDialog}
      variant="primary"
    />
  );
};
