import { FORM_ERROR } from 'final-form';
import { isEqual } from 'lodash-es';
import { FC } from 'react';
import { Form } from 'react-final-form';
import { marketplacePlansUpdate } from 'waldur-js-client';

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
import { offeringOwnsPricing } from '../../utils';

import { getBillingPeriods } from './constants';
import { PlanForm } from './PlanForm';
import { getEnteredPrices, savePlanPrices, toPriceValues } from './planPrices';
import { PlanPricesSection } from './PlanPricesSection';

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
  const { showErrorResponse } = useNotify();
  // A plan resources already use reprices from next month, which is a decision
  // of its own -- that stays with the Edit prices action and its notice. A
  // child offering has no prices of its own to edit, as PlanActions decides
  // for every other pricing action.
  const canEditPrices =
    (resolve.plan.resources_count ?? 0) === 0 &&
    offeringOwnsPricing(resolve.offering);

  const initialValues = {
    ...resolve.plan,
    unit: getBillingPeriods().find(({ value }) => value === resolve.plan.unit),
    prices: toPriceValues(
      resolve.plan.prices,
      resolve.offering.components ?? [],
      { keepZeros: true },
    ),
    ...(offeringHasBuiltinComponents(resolve.offering)
      ? {
          billing_mode: getPlanBillingModeOptions().find(
            ({ value }) => value === (resolve.plan.billing_mode || 'inherit'),
          ),
        }
      : {}),
  };

  const updatePlanMutation = useManagedMutation<any, any, any>({
    mutationFn: async (formData) => {
      const response = await marketplacePlansUpdate({
        path: { uuid: resolve.plan.uuid },
        body: formatPlan(formData),
      }).catch((error) => ({
        [FORM_ERROR]: error.message,
      }));
      // A rejected plan update resolves into a FORM_ERROR rather than
      // throwing, and its prices must not be written over it.
      if (response && FORM_ERROR in response) {
        return response;
      }
      const prices = canEditPrices ? getEnteredPrices(formData.prices) : {};
      // Every field is prefilled, so without this every save would rewrite
      // prices nobody touched.
      const changed = !isEqual(prices, getEnteredPrices(initialValues.prices));
      await savePlanPrices(
        changed ? resolve.plan.uuid : undefined,
        changed ? prices : {},
        (error) =>
          showErrorResponse(
            error,
            translate('Unable to update the prices of this plan.'),
          ),
      );
      return response;
    },
    successMessage: translate('Plan has been updated successfully.'),
    errorMessage: translate('Unable to update plan.'),
    refetch: resolve.refetch,
  });

  return (
    <Form
      onSubmit={(values) => updatePlanMutation.mutateAsync(values)}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid, errors }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Edit plan')}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  disabled={invalid}
                  // Named by what is actually invalid: a blank name is not a
                  // missing price.
                  disabledReason={
                    !invalid
                      ? undefined
                      : errors?.prices
                        ? translate(
                            'Fill in every component price, or leave the plan as it is.',
                          )
                        : translate('Please fill in the required fields')
                  }
                  submitting={submitting}
                  label={translate('Save')}
                />
              </>
            }
          >
            <PlanForm offering={resolve.offering} plan={resolve.plan} />
            {canEditPrices && (
              <PlanPricesSection
                offering={resolve.offering}
                plan={resolve.plan}
                showFreeChoice={false}
              />
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
