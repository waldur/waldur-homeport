import { useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { Project, projectCreditsList } from 'waldur-js-client';

import { BaseButton, Switch } from 'waldur-ui';

import { ENV } from '@/core/config';
import { SHORT_STALE_TIME } from '@/core/constants';
import { formatMonth } from '@/core/dateUtils';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { StaffOnlyIndicator } from '@/core/StaffOnlyIndicator';
import { minimalConsumptionLogicOptions } from '@/customer/credits/constants';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

import { CreditFieldEditButton } from './CreditFieldEditButton';
import { EarlierInvoices } from './EarlierInvoices';
import { formatCompensateIn } from './EarlierInvoicesField';

const CompensationPolicyDialog = lazyComponent(() =>
  import('@/customer/credits/CompensationPolicyDialog').then((module) => ({
    default: module.CompensationPolicyDialog,
  })),
);

/** Rows shown as a disabled switch rather than as text. */
const SWITCH_ROWS = ['apply_as_minimal_consumption', 'pay_earlier_invoices'];

interface ProjectCreditProps {
  project: Project;
}

export const ProjectCredit: React.FC<ProjectCreditProps> = ({ project }) => {
  const user = useUser();
  const { openDialog } = useModal();
  const {
    data: creditData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['ProjectCreditData', project?.uuid],

    queryFn: () =>
      projectCreditsList({
        query: { project_uuid: project?.uuid },
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
      {
        label: translate('Pay earlier invoices'),
        key: 'pay_earlier_invoices',
        value: Boolean(creditData?.pay_earlier_invoices),
        staffOnly: true,
      },
      {
        label: translate('Earlier invoices from'),
        key: 'earlier_invoices_from',
        value: creditData?.earlier_invoices_from
          ? formatMonth(creditData.earlier_invoices_from)
          : translate('The first invoice'),
        staffOnly: true,
      },
      {
        label: translate('Earlier invoices until'),
        key: 'earlier_invoices_until',
        value: creditData?.earlier_invoices_until
          ? formatMonth(creditData.earlier_invoices_until)
          : translate('The last closed invoice'),
        staffOnly: true,
      },
      {
        label: translate('Write the compensation on'),
        key: 'earlier_invoices_compensate_in',
        value: renderFieldOrDash(
          formatCompensateIn(creditData?.earlier_invoices_compensate_in),
        ),
        staffOnly: true,
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
        <>
          <FormTable>
            {rows.map((row) => (
              <FormTable.Item
                key={row.key}
                label={row.label}
                value={
                  SWITCH_ROWS.includes(row.key) ? (
                    <Switch
                      checked={!!row.value}
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
                  // The compensation policy is edited as a whole, by staff,
                  // in its own dialog; its rows here are read-only.
                  row.staffOnly ? null : (
                    <CreditFieldEditButton
                      credit={creditData}
                      name={row.key}
                      label={row.label}
                    />
                  )
                }
              />
            ))}
          </FormTable>
          {creditData && user?.is_staff ? (
            <div className="mt-3 flex items-center gap-1">
              <BaseButton
                variant="tertiary"
                size="sm"
                label={translate('Edit compensation policy')}
                onClick={() =>
                  openDialog(CompensationPolicyDialog, {
                    size: 'lg',
                    resolve: { credit: creditData, refetch },
                  })
                }
              />
              <StaffOnlyIndicator />
            </div>
          ) : null}
          {creditData ? <EarlierInvoices credit={creditData} /> : null}
        </>
      )}
    </FormTable.Card>
  );
};
