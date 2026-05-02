import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { marketplacePlansUpdatePrices } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { Offering, OfferingComponent, Plan } from '@/marketplace/types';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { EDIT_PLAN_FORM_ID } from './constants';
import { PricesTable } from './PricesTable';

const parsePrice = (value: unknown): number => {
  const num = parseFloat(String(value ?? 0));
  return isNaN(num) ? 0 : num;
};

const getInitialValues = (plan: Plan, components: OfferingComponent[]) => {
  const availableComponentTypes = new Set(components.map((c) => c.type));
  const filterPrices = (prices) =>
    Object.fromEntries(
      Object.entries(prices || {})
        .filter(([key]) => availableComponentTypes.has(key))
        .map(([key, value]) => [key, parsePrice(value)]),
    );

  const filteredPrices = filterPrices(plan.prices);
  const filteredFuturePrices = filterPrices(plan.future_prices);

  return {
    prices: filteredPrices,
    future_prices: filteredFuturePrices,
    new_prices:
      plan.resources_count > 0
        ? {
            ...filteredPrices,
            ...filteredFuturePrices,
          }
        : filteredPrices,
  };
};

export const EditPlanPricesDialog = connect<
  {},
  {},
  { resolve: { plan: Plan; offering: Offering } }
>((_, ownProps) => ({
  initialValues: getInitialValues(
    ownProps.resolve.plan,
    ownProps.resolve.offering.components,
  ),
}))(
  reduxForm<{}, { resolve: { offering; plan; refetch } }>({
    form: EDIT_PLAN_FORM_ID,
  })((props) => {
    const updatePricesMutation = useManagedMutation<any, any, any>({
      mutationFn: (formData) =>
        marketplacePlansUpdatePrices({
          path: { uuid: props.resolve.plan.uuid },
          body: {
            prices: formData.new_prices,
          },
        }),
      successMessage: translate('Prices have been updated successfully.'),
      errorMessage: translate('Unable to update prices.'),
      refetch: props.resolve.refetch,
    });

    return (
      <form
        onSubmit={props.handleSubmit((values) =>
          updatePricesMutation.mutateAsync(values),
        )}
      >
        <ModalDialog
          title={
            props.resolve.plan.resources_count > 0
              ? translate('Edit prices for next month')
              : translate('Edit prices for current month')
          }
          footer={
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={translate('Save')}
            />
          }
        >
          <PricesTable
            components={props.resolve.offering.components}
            plan={props.resolve.plan}
          />
        </ModalDialog>
      </form>
    );
  }),
);
