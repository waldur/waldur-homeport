import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  marketplacePlansUpdate,
  ProviderPlanDetailsRequest,
} from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/hooks';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/hooks';

import { formatPlan } from '../../store/utils';

import { getBillingPeriods } from './constants';
import { PlanForm } from './PlanForm';

interface EditPlanDescriptionDialogProps {
  resolve: {
    offering: any;
    plan: any;
    refetch: () => Promise<void>;
  };
}

export const EditPlanDescriptionDialog: FC<EditPlanDescriptionDialogProps> = ({
  resolve,
}) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  const initialValues = {
    ...resolve.plan,
    unit: getBillingPeriods().find(({ value }) => value === resolve.plan.unit),
  };

  const onSubmit = async (formData) => {
    try {
      await marketplacePlansUpdate({
        path: { uuid: resolve.plan.uuid },
        body: formatPlan(formData) as ProviderPlanDetailsRequest,
      });
      showSuccess(translate('Plan has been updated successfully.'));
      await resolve.refetch();
      closeDialog();
    } catch (error) {
      showErrorResponse(error, translate('Unable to update plan.'));
    }
  };

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Edit plan')}
            footer={
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={translate('Save')}
              />
            }
          >
            <PlanForm />
          </ModalDialog>
        </form>
      )}
    />
  );
};
