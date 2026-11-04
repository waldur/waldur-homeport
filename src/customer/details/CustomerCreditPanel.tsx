import { ArrowsLeftRightIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { customerCreditsList } from 'waldur-js-client';

import { PropertyCard, PropertyItem, PropertyList } from 'waldur-ui';

import { ENV } from '@/core/config';
import { SHORT_STALE_TIME } from '@/core/constants';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { CompactEditButton } from '@/form/CompactEditButton';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

import { minimalConsumptionLogicOptions } from '../credits/constants';
import { CreditFieldEditButton } from '../credits/CreditFieldEditButton';
import { getCreditKindHelp } from '../credits/creditKinds';

import { StaffOnlyIndicator } from './StaffOnlyIndicator';
import { CustomerEditPanelProps } from './types';

const AdjustWithdrawableDialog = lazyComponent(() =>
  import('../credits/AdjustWithdrawableDialog').then((module) => ({
    default: module.AdjustWithdrawableDialog,
  })),
);

const TopUpCreditDialog = lazyComponent(() =>
  import('../credits/TopUpCreditDialog').then((module) => ({
    default: module.TopUpCreditDialog,
  })),
);

const ReclassifyCreditDialog = lazyComponent(() =>
  import('../credits/ReclassifyCreditDialog').then((module) => ({
    default: module.ReclassifyCreditDialog,
  })),
);

export const CustomerCreditPanel: FC<CustomerEditPanelProps> = (props) => {
  const user = useUser();
  const { openDialog } = useModal();

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

  const rows = useMemo(() => {
    // The credit is made of lots: prepayments recorded by staff (paid),
    // credit allocated by staff (granted) and earnings (withdrawable). Each
    // row says what its kind is for, since they behave differently.
    const help = getCreditKindHelp();
    return [
      {
        label: translate('Total credit ({currency})', {
          currency: ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
        }),
        key: 'value',
        value: renderFieldOrDash(creditData?.value),
        description: help.total,
      },
      {
        label: translate('Paid credit ({currency})', {
          currency: ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
        }),
        key: 'paid_balance',
        value: renderFieldOrDash(creditData?.paid_balance),
        description: help.paid,
        readOnly: true,
      },
      {
        label: translate('Granted credit ({currency})', {
          currency: ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
        }),
        key: 'granted_balance',
        value: renderFieldOrDash(creditData?.granted_balance),
        description: help.granted,
        readOnly: true,
      },
      {
        label: translate('Withdrawable balance ({currency})', {
          currency: ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
        }),
        key: 'withdrawable_balance',
        value: renderFieldOrDash(creditData?.withdrawable_balance),
        description: help.withdrawable,
        readOnly: true,
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
    ];
  }, [creditData]);

  return (
    <PropertyCard bordered>
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred loadData={refetch} />
      ) : (
        <PropertyList>
          {rows.map((row) => (
            <PropertyItem
              key={row.key}
              label={row.label}
              description={row.description}
              value={
                row.key === 'apply_as_minimal_consumption'
                  ? row.value
                    ? translate('Enabled')
                    : translate('Disabled')
                  : row.value
              }
              actions={
                user.is_staff &&
                (row.key === 'paid_balance' ? (
                  <>
                    <StaffOnlyIndicator />
                    <CompactEditButton
                      iconNode={<PlusCircleIcon weight="bold" />}
                      tooltip={translate('Top up')}
                      data-testid="top-up-credit"
                      onClick={() =>
                        openDialog(TopUpCreditDialog, {
                          resolve: { credit: creditData, refetch },
                        })
                      }
                    />
                  </>
                ) : row.key === 'granted_balance' ? (
                  <>
                    <StaffOnlyIndicator />
                    <CompactEditButton
                      iconNode={<ArrowsLeftRightIcon weight="bold" />}
                      tooltip={
                        Number(creditData?.granted_balance) > 0
                          ? translate('Reclassify as paid credit')
                          : translate(
                              'There is no granted credit to reclassify.',
                            )
                      }
                      disabled={!(Number(creditData?.granted_balance) > 0)}
                      data-testid="reclassify-credit"
                      onClick={() =>
                        openDialog(ReclassifyCreditDialog, {
                          resolve: { credit: creditData, refetch },
                        })
                      }
                    />
                  </>
                ) : row.key === 'withdrawable_balance' ? (
                  <>
                    <StaffOnlyIndicator />
                    <CompactEditButton
                      fieldName={row.label}
                      onClick={() =>
                        openDialog(AdjustWithdrawableDialog, {
                          resolve: { credit: creditData, refetch },
                        })
                      }
                    />
                  </>
                ) : (
                  !row.readOnly && (
                    <>
                      <StaffOnlyIndicator />
                      <CreditFieldEditButton
                        credit={creditData}
                        name={row.key}
                        label={row.label}
                        disabled={row.disabled}
                      />
                    </>
                  )
                ))
              }
            />
          ))}
        </PropertyList>
      )}
    </PropertyCard>
  );
};
