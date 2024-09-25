import { Check, X } from '@phosphor-icons/react';
import { FC } from 'react';
import { Badge } from 'react-bootstrap';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { policyPeriodOptions } from '@waldur/customer/cost-policies/utils';
import { translate } from '@waldur/i18n';
import { useOrganizationGroups } from '@waldur/marketplace/common/utils';
import { Table } from '@waldur/table';
import { TableProps } from '@waldur/table/Table';

import { getOfferingPolicyActionOptions } from '../utils';

export const PoliciesTable: FC<TableProps> = ({ columns, ...props }) => {
  const {
    isLoading: groupsLoading,
    error: groupsError,
    data: organizationGroups,
    refetch: refetchGroups,
  } = useOrganizationGroups();

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
          title: translate('Has fired'),
          render: ({ row }) =>
            !row.has_fired ? (
              <Badge
                bg={null}
                className="fs-8 fw-bolder lh-base badge-light-danger badge-pill"
              >
                <X size={12} className="text-danger me-2" />
                {translate('No')}
              </Badge>
            ) : (
              <Badge
                bg={null}
                className="fs-8 fw-bolder lh-base badge-light-success badge-pill"
              >
                <Check size={12} className="text-success me-2" />
                {translate('Yes')}
              </Badge>
            ),
        },
      ]}
      verboseName={translate('Policies')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      showPageSizeSelector={true}
      {...props}
    />
  );
};
