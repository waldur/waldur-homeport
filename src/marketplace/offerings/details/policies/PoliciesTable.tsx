import { QuestionIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, useMemo } from 'react';

import { BooleanBadge } from '@waldur/core/BooleanBadge';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Tip } from '@waldur/core/Tooltip';
import { policyPeriodOptions } from '@waldur/customer/cost-policies/utils';
import { translate } from '@waldur/i18n';
import { useOrganizationGroups } from '@waldur/marketplace/common/utils';
import Table from '@waldur/table/Table';
import { TableProps } from '@waldur/table/types';

import { getOfferingPolicyActionOptions } from '../utils';

export const PoliciesTable: FC<TableProps> = ({ columns, ...props }) => {
  const {
    isLoading: groupsLoading,
    error: groupsError,
    data: organizationGroups,
    refetch: refetchGroups,
  } = useOrganizationGroups();

  const { state } = useCurrentStateAndParams();
  const tabs = useMemo(
    () => [
      {
        key: 'cost-policy',
        title: translate('Cost'),
        state: state.name,
        params: { tab: 'cost-policy' },
      },
      {
        key: 'usage-policy',
        title: translate('Usage'),
        state: state.name,
        params: { tab: 'usage-policy' },
      },
    ],

    [state],
  );

  return (
    <Table
      columns={[
        ...columns,
        {
          title: translate('Action'),
          render: ({ row }) => (
            <>
              {
                getOfferingPolicyActionOptions().find(
                  (option) => option.value === row.actions,
                )?.label
              }
            </>
          ),
        },
        {
          title: translate('Period'),
          render: ({ row }) => (
            <>
              {Object.values(policyPeriodOptions).find(
                (option) => option.value === row.period,
              )?.label || row.period_name}
            </>
          ),
        },
        {
          title: translate('Organization groups'),
          render: ({ row }) =>
            groupsLoading ? (
              <LoadingSpinner />
            ) : groupsError ? (
              <LoadingErred loadData={refetchGroups} />
            ) : (
              <>
                {row.organization_groups
                  .map(
                    (url) =>
                      organizationGroups.find((group) => group.url === url)
                        ?.name,
                  )
                  .filter(Boolean)
                  .join(', ')}
              </>
            ),
        },
        {
          title: (
            <>
              {translate('Action triggered')}{' '}
              <Tip
                id="action-triggered-tooltip"
                label={translate(
                  "Shows whether this policy's action has been executed (for example, pausing or downscaling) after exceeding the limit.",
                )}
              >
                <QuestionIcon size={18} weight="bold" />
              </Tip>
            </>
          ),
          render: ({ row }) => <BooleanBadge value={row.has_fired} />,
        },
      ]}
      title={translate('Policy')}
      verboseName={translate('Policies')}
      tabs={tabs}
      initialSorting={{ field: 'created', mode: 'desc' }}
      showPageSizeSelector={true}
      {...props}
    />
  );
};
