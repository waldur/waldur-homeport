import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Form } from 'react-final-form';
import { marketplacePlansCreate } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import {
  getPlanBillingModeOptions,
  offeringHasBuiltinComponents,
} from '@/marketplace/details/plan/billingMode';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';

import { formatPlan } from '../../store/utils';

import { getBillingPeriods } from './constants';
import { optionValue, PlanForm } from './PlanForm';
import {
  getEnteredPrices,
  isPricingIncomplete,
  savePlanPrices,
  toPriceValues,
} from './planPrices';
import { PlanPricesSection } from './PlanPricesSection';

const findBillingModeOption = (value?: string) =>
  getPlanBillingModeOptions().find(
    (option) => option.value === (value || 'inherit'),
  );

interface AddPlanDialogProps {
  resolve: {
    offering: any;
    refetch: () => Promise<void>;
    plan?: any;
  };
}

export const AddPlanDialog: FC<AddPlanDialogProps> = ({ resolve }) => {
  const { showErrorResponse } = useNotify();

  const initialValues = resolve.plan
    ? {
        ...resolve.plan,
        name: translate('Clone of {plan}', { plan: resolve.plan.name }),
        unit: getBillingPeriods().find(
          ({ value }) => value === resolve.plan.unit,
        ),
        prices: toPriceValues(
          resolve.plan.prices,
          resolve.offering.components ?? [],
          { keepZeros: false },
        ),
        ...(offeringHasBuiltinComponents(resolve.offering)
          ? { billing_mode: findBillingModeOption(resolve.plan.billing_mode) }
          : {}),
      }
    : offeringHasBuiltinComponents(resolve.offering)
      ? { billing_mode: findBillingModeOption() }
      : undefined;

  const createPlanMutation = useManagedMutation<any, any, any>({
    mutationFn: async (formData) => {
      const response = await marketplacePlansCreate({
        body: {
          offering: resolve.offering.url,
          ...formatPlan(formData),
        },
      });
      // A plan marked free is created as it is: every component priced at 0,
      // which is what the backend already stores.
      await savePlanPrices(
        response?.data?.uuid,
        formData.is_free ? {} : getEnteredPrices(formData.prices),
        (error) =>
          showErrorResponse(
            error,
            translate(
              'The plan has been created, but its prices could not be saved. Set them with the Edit prices action.',
            ),
          ),
      );
      return response;
    },
    successMessage: translate('Plan has been created successfully.'),
    errorMessage: translate('Unable to create plan.'),
    refetch: resolve.refetch,
  });

  return (
    <Form
      onSubmit={(values) => createPlanMutation.mutateAsync(values)}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid, values }) => {
        // Neither priced nor declared free: the one thing this dialog exists
        // to stop, so it blocks rather than warns after the fact.
        const pricingIncomplete = isPricingIncomplete(
          resolve.offering,
          optionValue(values?.billing_mode),
          values,
        );
        return (
          <form onSubmit={handleSubmit}>
            <ModalDialog
              title={translate('Add plan')}
              footer={
                <>
                  <CloseDialogButton />
                  <SubmitButton
                    disabled={invalid || pricingIncomplete}
                    disabledReason={
                      pricingIncomplete
                        ? translate(
                            'Price at least one component, or mark the plan as free.',
                          )
                        : undefined
                    }
                    submitting={submitting}
                    label={translate('Create')}
                  />
                </>
              }
              iconNode={<PlusCircleIcon weight="bold" />}
              iconColor="success"
            >
              <PlanForm offering={resolve.offering} />
              <PlanPricesSection offering={resolve.offering} />
            </ModalDialog>
          </form>
        );
      }}
    />
  );
};
