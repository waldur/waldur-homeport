import { useQuery } from '@tanstack/react-query';
import { isEqual } from 'lodash-es';
import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceResourcesOfferingRetrieve,
  marketplaceResourcesRetrieve,
  marketplaceResourcesSetSpendingLimits,
  Offering,
  Resource,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { SpendingLimitFields } from '@/marketplace/common/SpendingLimitFields';
import {
  formatSpendingAmount,
  formatSpendingLimits,
  getCappedComponents,
  getOfferedSpendingLimits,
  getOfferedPeriods,
  getSpendingLimitLabel,
  getSpendingLimitsNotice,
  SPENDING_LIMIT_PERIODS,
  SpendingLimitFormValues,
  SpendingLimitPeriod,
  isEmptyAmount,
} from '@/marketplace/common/spendingLimits';
import {
  findResourcePlan,
  getEffectiveComponents,
} from '@/marketplace/details/plan/effectiveComponents';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { getMarketplaceResourceUuid } from '../actions/utils';

/** The components of `offering` that take spending limits under the resource's plan. */
export const getResourceCappedComponents = (
  offering: Pick<Offering, 'type' | 'components' | 'plans'>,
  planUuid: string | null | undefined,
) =>
  getCappedComponents(
    getEffectiveComponents(
      offering,
      findResourcePlan(offering.plans, planUuid),
    ),
  );

/**
 * Limits the resource holds on periods the provider no longer offers. They
 * stay in force, but the API accepts only offered periods, so saving the
 * dialog drops them.
 */
const getDroppedLimits = (
  spendingLimits: Resource['spending_limits'] | undefined,
  components: ReturnType<typeof getResourceCappedComponents>,
) => {
  const result: {
    type: string;
    period: SpendingLimitPeriod;
    amount: number;
  }[] = [];
  for (const [type, periods] of Object.entries(spendingLimits || {})) {
    const component = components.find((c) => c.type === type);
    const offered = component ? getOfferedPeriods(component) : [];
    for (const period of SPENDING_LIMIT_PERIODS) {
      const amount = periods?.[period];
      if (!isEmptyAmount(amount) && !offered.includes(period)) {
        result.push({ type, period, amount });
      }
    }
  }
  return result;
};

const loadData = async (resourceUuid: string) => {
  const [resource, offering] = await Promise.all([
    marketplaceResourcesRetrieve({ path: { uuid: resourceUuid } }).then(
      (response) => response.data,
    ),
    marketplaceResourcesOfferingRetrieve({ path: { uuid: resourceUuid } }).then(
      (response) => response.data,
    ),
  ]);
  return { resource, offering };
};

interface FormValues {
  spending_limits?: SpendingLimitFormValues;
}

export const SetSpendingLimitsDialog: FC<{
  resolve: { resource; refetch? };
}> = ({ resolve }) => {
  const resourceUuid = getMarketplaceResourceUuid(resolve.resource);
  const { data, isLoading, error } = useQuery({
    queryKey: ['SetSpendingLimitsDialog', resourceUuid],
    queryFn: () => loadData(resourceUuid),
    enabled: Boolean(resourceUuid),
  });

  // Memoised on the parts the form uses, not on the whole response; the form
  // also compares initial values by content (initialValuesEqual), since a
  // refetched offering is a new object whenever a counter such as order_count
  // moves. Either way a refetch does not wipe what the customer typed.
  const offering = data?.offering;
  const planUuid = data?.resource.plan_uuid;
  const spendingLimits = data?.resource.spending_limits;

  const components = useMemo(
    () => (offering ? getResourceCappedComponents(offering, planUuid) : []),
    [offering, planUuid],
  );

  // Only offered periods: the others are neither shown nor sent, so they must
  // not fail the ordering check of the ones that are.
  const initialValues = useMemo<FormValues>(
    () => ({
      spending_limits: getOfferedSpendingLimits(spendingLimits, components),
    }),
    [spendingLimits, components],
  );

  const dropped = useMemo(
    () => getDroppedLimits(spendingLimits, components),
    [spendingLimits, components],
  );

  const mutation = useManagedMutation<unknown, unknown, FormValues>({
    mutationFn: (values) =>
      marketplaceResourcesSetSpendingLimits({
        path: { uuid: resourceUuid },
        body: {
          spending_limits: formatSpendingLimits(
            values.spending_limits,
            components,
          ),
        },
      }),
    successMessage: translate('Spending limits have been updated.'),
    errorMessage: translate('Unable to update spending limits.'),
    refetch: resolve.refetch ? () => resolve.refetch() : undefined,
    invalidateQueries: [
      { queryKey: ['SetSpendingLimitsDialog', resourceUuid] },
    ],
  });

  return (
    <Form<FormValues>
      onSubmit={(values) =>
        mutation.mutateAsync(values).catch(() => {
          // Error is handled by useManagedMutation
        })
      }
      initialValues={initialValues}
      initialValuesEqual={isEqual}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Change spending limits')}
            subtitle={
              <ScopeSubtitle
                label={translate('Resource name')}
                name={data?.resource.name || resolve.resource.name}
              />
            }
            footer={
              <>
                <CloseDialogButton />
                {data && (components.length > 0 || dropped.length > 0) && (
                  <SubmitButton
                    submitting={submitting}
                    disabled={invalid}
                    label={
                      components.length > 0
                        ? translate('Save')
                        : translate('Remove limits')
                    }
                  />
                )}
              </>
            }
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : error ? (
              <h3>{translate('Unable to load data.')}</h3>
            ) : components.length === 0 && dropped.length === 0 ? (
              <p className="mb-0">
                {translate(
                  'The offering does not let customers set spending limits on this resource.',
                )}
              </p>
            ) : (
              <>
                {components.length > 0 && (
                  <p className="mb-5 text-sm text-tertiary">
                    {getSpendingLimitsNotice()}{' '}
                    {translate('Clear a field to remove that limit.')}
                  </p>
                )}
                {dropped.length > 0 && (
                  <AlertItem
                    variant="warning"
                    type="floating"
                    iconSize="md"
                    className="mb-5"
                    title={translate(
                      'Some limits are on periods the provider no longer offers',
                    )}
                    body={translate(
                      'They stay in force until you save; saving removes them: {limits}.',
                      {
                        limits: dropped
                          .map(({ type, period, amount }) =>
                            translate('{limit} of {amount} on {component}', {
                              limit: getSpendingLimitLabel(period),
                              amount: formatSpendingAmount(amount),
                              component:
                                data.offering.components?.find(
                                  (c) => c.type === type,
                                )?.name || type,
                            }),
                          )
                          .join(', '),
                      },
                    )}
                    data-testid="dropped-spending-limits"
                  />
                )}
                {components.length > 0 && (
                  <SpendingLimitFields components={components} />
                )}
              </>
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
