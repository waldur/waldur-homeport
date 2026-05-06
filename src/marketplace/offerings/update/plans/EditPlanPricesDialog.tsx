import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import { marketplacePlansUpdatePrices } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { Offering, OfferingComponent, Plan } from '@/marketplace/types';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

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

export const EditPlanPricesDialog: FC<{
  resolve: { plan: Plan; offering: Offering; refetch?(): void };
}> = (props) => {
  const initialValues = useMemo(
    () =>
      getInitialValues(props.resolve.plan, props.resolve.offering.components),
    [props.resolve.plan, props.resolve.offering.components],
  );

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
    <Form
      initialValues={initialValues}
      onSubmit={(values) => updatePricesMutation.mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              props.resolve.plan.resources_count > 0
                ? translate('Edit prices for next month')
                : translate('Edit prices for current month')
            }
            footer={
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
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
      )}
    />
  );
};
