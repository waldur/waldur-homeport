import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Form } from 'react-final-form';
import { marketplacePlansCreate } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/hooks';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/hooks';

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
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  const initialValues = resolve.plan
    ? {
        ...resolve.plan,
        name: translate('Clone of {plan}', { plan: resolve.plan.name }),
        unit: getBillingPeriods().find(
          ({ value }) => value === resolve.plan.unit,
        ),
      }
    : undefined;

  const onSubmit = async (formData) => {
    try {
      await marketplacePlansCreate({
        body: {
          offering: resolve.offering.url,
          ...formatPlan(formData),
        },
      });
      showSuccess(translate('Plan has been created successfully.'));
      await resolve.refetch();
      closeDialog();
    } catch (error) {
      showErrorResponse(error, translate('Unable to create plan.'));
    }
  };

  return (
    <Form
      onSubmit={onSubmit}
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
