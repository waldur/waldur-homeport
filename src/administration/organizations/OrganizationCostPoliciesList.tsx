import { Check, X } from '@phosphor-icons/react';
import { FC } from 'react';
import { Badge } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { CostPolicyCreateButton } from '@waldur/customer/cost-policies/CostPolicyCreateButton';
import { CostPolicyDeleteButton } from '@waldur/customer/cost-policies/CostPolicyDeleteButton';
import { getCostPolicyActionOptions } from '@waldur/customer/cost-policies/utils';
import { OrganizationLink } from '@waldur/customer/list/OrganizationLink';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { OrganizationCostPoliciesFilter } from './OrganizationCostPoliciesFilter';

const filtersSelector = createSelector(
  getFormValues('OrgCostPoliciesFilter'),
  (filterValues: any) => {
    const result: Record<string, any> = {};
    if (filterValues?.organization) {
      result.customer_uuid = filterValues.organization.uuid;
    }
    return result;
  },
);

export const OrganizationCostPoliciesList: FC = () => {
  const filter = useSelector(filtersSelector);

  const tableProps = useTable({
    table: 'OrgCostPoliciesList',
    filter: filter,
    fetchData: createFetcher('marketplace-customer-estimated-cost-policies'),
    queryField: 'query',
  });

  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Organization'),
          render: ({ row }) => (
            <OrganizationLink
              row={{ name: row.scope_name, uuid: row.scope_uuid }}
            />
          ),
          filter: 'organization',
        },
        {
          title: translate('Cost threshold'),
          render: ({ row }) => <>{defaultCurrency(row.limit_cost)}</>,
        },
        {
          title: translate('Action'),
          render: ({ row }) => (
            <>
              {
                getCostPolicyActionOptions().find(
                  (option) => option.value === row.actions,
                )?.label
              }
            </>
          ),
        },
        {
          title: translate('Has fired'),
          render: ({ row }) =>
            row.has_fired === true ? (
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
        {
          title: translate('Estimated current cost'),
          render: ({ row }) => (
            <>
              {defaultCurrency(
                (row.billing_price_estimate &&
                  row.billing_price_estimate.current) ||
                  0,
              )}
            </>
          ),
        },
      ]}
      verboseName={translate('Cost policies')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      filters={<OrganizationCostPoliciesFilter />}
      hoverableRow={({ row }) => (
        <CostPolicyDeleteButton
          row={row}
          type="organization"
          refetch={tableProps.fetch}
        />
      )}
      hasQuery={true}
      showPageSizeSelector={true}
      actions={
        <CostPolicyCreateButton
          type="organization"
          refetch={tableProps.fetch}
        />
      }
    />
  );
};
