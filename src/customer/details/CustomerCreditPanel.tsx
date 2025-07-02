import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { customerCreditsList } from 'waldur-js-client';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { ENV } from '@waldur/core/config';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { getUser } from '@waldur/workspace/selectors';

import { minimalConsumptionLogicOptions } from '../credits/constants';
import { CreditFieldEditButton } from '../credits/CreditFieldEditButton';

import { CustomerEditPanelProps } from './types';

export const CustomerCreditPanel: FC<CustomerEditPanelProps> = (props) => {
  const user = useSelector(getUser);

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
    staleTime: 60 * 1000,
  });

  const rows = useMemo(
    () => [
      {
        label:
          translate('Allocated credit') +
          ` (${ENV.plugins.WALDUR_CORE.CURRENCY_NAME})`,
        key: 'value',
        value: creditData?.value || 'N/A',
      },
      {
        label: translate('Offering(s)'),
        key: 'offerings',
        value:
          creditData?.offerings.map((offer) => offer.name).join(', ') || 'N/A',
      },
      {
        label:
          translate('Credit allocated to projects') +
          ` (${ENV.plugins.WALDUR_CORE.CURRENCY_NAME})`,
        key: 'allocated_to_projects',
        value: creditData?.allocated_to_projects || 'N/A',
        disabled: true,
      },
      {
        label: translate('End date'),
        key: 'end_date',
        value: creditData?.end_date || 'N/A',
      },
      {
        label: translate('Minimal consumption logic'),
        key: 'minimal_consumption_logic',
        value:
          minimalConsumptionLogicOptions.find(
            (opt) => opt.value === creditData?.minimal_consumption_logic,
          )?.label || 'N/A',
      },
      {
        label: translate('Expected consumption ({currency} per month)', {
          currency: ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
        }),
        key: 'expected_consumption',
        value: creditData?.expected_consumption || 'N/A',
      },
      {
        label: translate('Grace coefficient') + ' (%)',
        key: 'grace_coefficient',
        value: creditData?.grace_coefficient || 'N/A',
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
                  <CreditFieldEditButton
                    credit={creditData}
                    name={row.key}
                    disabled={row.disabled}
                  />
                )
              }
            />
          ))}
        </FormTable>
      )}
    </FormTable.Card>
  );
};
