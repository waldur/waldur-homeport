import { FORM_ERROR } from 'final-form';
import { FC } from 'react';
import { Form } from 'react-final-form';
import { marketplacePlansUpdate } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

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
  const initialValues = {
    ...resolve.plan,
    unit: getBillingPeriods().find(({ value }) => value === resolve.plan.unit),
  };

  const updatePlanMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      marketplacePlansUpdate({
        path: { uuid: resolve.plan.uuid },
        body: formatPlan(formData),
      }).catch((error) => ({
        [FORM_ERROR]: error.message,
      })),
    successMessage: translate('Plan has been updated successfully.'),
    errorMessage: translate('Unable to update plan.'),
    refetch: resolve.refetch,
  });

  return (
    <Form
      onSubmit={(values) => updatePlanMutation.mutateAsync(values)}
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
