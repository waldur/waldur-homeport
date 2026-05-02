import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { customerCreditsList } from 'waldur-js-client';

import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';
import { ENV } from '@/core/config';
import { SHORT_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

import { minimalConsumptionLogicOptions } from '../credits/constants';
import { CreditFieldEditButton } from '../credits/CreditFieldEditButton';

import { StaffOnlyIndicator } from './StaffOnlyIndicator';
import { CustomerEditPanelProps } from './types';

export const CustomerCreditPanel: FC<CustomerEditPanelProps> = (props) => {
  const user = useUser();

  const {
    data: creditData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['CustomerCreditData', props.customer?.uuid],

    queryFn: () =>
      customerCreditsList({
        query: { customer_uuid: props.customer?.uuid },
      }).then((response) => response.data.length > 0 && response.data[0]),

    refetchOnWindowFocus: false,
    staleTime: SHORT_STALE_TIME,
  });

  const rows = useMemo(
    () => [
      {
        label: translate('Allocated credit ({currency})', {
          currency: ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
        }),
        key: 'value',
        value: renderFieldOrDash(creditData?.value),
      },
      {
        label: translate('Offering(s)'),
        key: 'offerings',
        value: renderFieldOrDash(
          creditData?.offerings.map((offer) => offer.name).join(', '),
        ),
      },
      {
        label: translate('Credit allocated to projects ({currency})', {
          currency: ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
        }),
        key: 'allocated_to_projects',
        value: renderFieldOrDash(creditData?.allocated_to_projects),
        disabled: true,
      },
      {
        label: translate('End date'),
        key: 'end_date',
        value: renderFieldOrDash(creditData?.end_date),
      },
      {
        label: translate('Minimal consumption logic'),
        key: 'minimal_consumption_logic',
        value: renderFieldOrDash(
          minimalConsumptionLogicOptions.find(
            (opt) => opt.value === creditData?.minimal_consumption_logic,
          )?.label,
        ),
      },
      {
        label: translate('Expected consumption ({currency} per month)', {
          currency: ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
        }),
        key: 'expected_consumption',
        value: renderFieldOrDash(creditData?.expected_consumption),
      },
      {
        label: translate('Grace coefficient (%)'),
        key: 'grace_coefficient',
        value: renderFieldOrDash(creditData?.grace_coefficient),
      },
      {
        label: translate('Apply as minimal consumption'),
        key: 'apply_as_minimal_consumption',
        value: Boolean(creditData?.apply_as_minimal_consumption),
      },
    ],

    [creditData],
  );

  return (
    <FormTable.Card className="card-bordered">
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred loadData={refetch} />
      ) : (
        <FormTable>
          {rows.map((row) => (
            <FormTable.Item
              key={row.key}
              label={row.label}
              value={
                row.key === 'apply_as_minimal_consumption' ? (
                  <AwesomeCheckbox
                    value={!!row.value}
                    label={
                      row.value ? translate('Enabled') : translate('Disabled')
                    }
                    disabled
                  />
                ) : (
                  row.value
                )
              }
              actions={
                user.is_staff && (
                  <>
                    <StaffOnlyIndicator />
                    <CreditFieldEditButton
                      credit={creditData}
                      name={row.key}
                      disabled={row.disabled}
                    />
                  </>
                )
              }
            />
          ))}
        </FormTable>
      )}
    </FormTable.Card>
  );
};
