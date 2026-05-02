import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Form } from 'react-final-form';
import { marketplacePlansCreate } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { formatPlan } from '../../store/utils';

import { getBillingPeriods } from './constants';
import { PlanForm } from './PlanForm';

interface AddPlanDialogProps {
  resolve: {
    offering: any;
    refetch: () => Promise<void>;
    plan?: any;
  };
}

export const AddPlanDialog: FC<AddPlanDialogProps> = ({ resolve }) => {
  const initialValues = resolve.plan
    ? {
        ...resolve.plan,
        name: translate('Clone of {plan}', { plan: resolve.plan.name }),
        unit: getBillingPeriods().find(
          ({ value }) => value === resolve.plan.unit,
        ),
      }
    : undefined;

  const createPlanMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      marketplacePlansCreate({
        body: {
          offering: resolve.offering.url,
          ...formatPlan(formData),
        },
      }),
    successMessage: translate('Plan has been created successfully.'),
    errorMessage: translate('Unable to create plan.'),
    refetch: resolve.refetch,
  });

  return (
    <Form
      onSubmit={(values) => createPlanMutation.mutateAsync(values)}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Add plan')}
            footer={
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={translate('Create')}
              />
            }
            iconNode={<PlusCircleIcon weight="bold" />}
            iconColor="success"
          >
            <PlanForm />
          </ModalDialog>
        </form>
      )}
    />
  );
};
