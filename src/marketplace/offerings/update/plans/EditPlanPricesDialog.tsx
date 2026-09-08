import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  marketplacePlansUpdatePrices,
  ProviderOfferingDetails as Offering,
  OfferingComponent,
  ProviderPlanDetails as Plan,
} from 'waldur-js-client';

import { AlertItem } from '@/core/AlertItem';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { resolvePlanComponents } from '@/marketplace/details/plan/effectiveComponents';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { PricesTable } from './PricesTable';

const parsePrice = (value: unknown): number => {
  const num = parseFloat(String(value ?? 0));
  return isNaN(num) ? 0 : num;
};

const getInitialValues = (plan: Plan, components: OfferingComponent[]) => {
  const availableComponentTypes = new Set(components.map((c) => c.type));
  const filterPrices = (prices, skipEmpty = false) =>
    Object.fromEntries(
      Object.entries(prices || {})
        .filter(
          ([key, value]) =>
            availableComponentTypes.has(key) &&
            (!skipEmpty || (value !== null && value !== undefined)),
        )
        .map(([key, value]) => [key, parsePrice(value)]),
    );

  const filteredPrices = filterPrices(plan.prices);
  // A component without a pending price change has a null future price, which
  // must not overwrite the current price with 0. A future price of 0 is a real
  // value and is kept.
  const filteredFuturePrices = filterPrices(plan.future_prices, true);

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
  // A usage plan prices core-hours and GB-hours, not the cores and GB the
  // offering's components are declared in.
  const components = useMemo(
    () =>
      resolvePlanComponents(
        props.resolve.offering.components,
        props.resolve.plan,
      ),
    [props.resolve.offering.components, props.resolve.plan],
  );
  const initialValues = useMemo(
    () => getInitialValues(props.resolve.plan, components),
    [props.resolve.plan, components],
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
            title={translate('Edit prices')}
            footer={
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={translate('Save')}
              />
            }
          >
            <AlertItem
              className="mb-5"
              title={
                props.resolve.plan.resources_count > 0
                  ? translate('New prices apply from next month')
                  : translate('New prices apply immediately')
              }
              body={
                props.resolve.plan.resources_count > 0
                  ? translate(
                      '{count} resource(s) have been created on this plan. What has already been charged is not changed.',
                      { count: props.resolve.plan.resources_count },
                    )
                  : translate('This plan has no resources yet.')
              }
            />
            <PricesTable components={components} plan={props.resolve.plan} />
          </ModalDialog>
        </form>
      )}
    />
  );
};
