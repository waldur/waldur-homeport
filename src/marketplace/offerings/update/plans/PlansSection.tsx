import { FC, useCallback, useMemo } from 'react';
import {
  marketplacePlansList,
  ProviderPlanDetails as Plan,
} from 'waldur-js-client';

import { StateIndicator } from '@/core/StateIndicator';
import { FilteredEventsButton } from '@/events/FilteredEventsButton';
import { translate } from '@/i18n';
import { hidePlanAddButton } from '@/marketplace/common/registry';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { useUser } from '@/workspace/hooks';

import { offeringOwnsPricing } from '../../utils';
import { OfferingSectionProps } from '../types';
import { useOfferingAccountingTableTabs } from '../utils';

import { AddPlanButton } from './AddPlanButton';
import { PlanActions } from './PlanActions';
import { PlanExpandableRow } from './PlanExpandableRow';

export const PlansSection: FC<OfferingSectionProps> = (props) => {
  const user = useUser();

  const columns = [
    {
      title: translate('Name'),
      render: ({ row }) => row.name,
      copyField: (row) => row.name,
    },
    {
      title: translate('Status'),
      render: ({ row }) => (
        <StateIndicator
          label={row.archived ? translate('Archived') : translate('Active')}
          variant={row.archived ? 'warning' : 'success'}
          outline
          pill
        />
      ),
    },
    {
      title: translate('Resources'),
      render: ({ row }) =>
        row.resources_count === 0
          ? translate('Not used')
          : row.resources_count === 1
            ? translate('Used by one resource')
            : translate('Used by {count} resources', {
                count: row.resources_count,
              }),
    },
    {
      title: translate('Organization groups'),
      render: ({ row }) =>
        row.organization_groups?.map((group) => group.name).join(', ') ||
        DASH_ESCAPE_CODE,
    },
    {
      title: translate('UUID'),
      render: ({ row }) => row.uuid,
    },
  ];

  const filter = useMemo(
    () => ({ offering_uuid: props.offering.uuid }),
    [props.offering],
  );

  const tableProps = useTable({
    table: 'OfferingPlans',
    filter,
    fetchData: createFetcher(marketplacePlansList),
  });

  const canCreatePlan =
    offeringOwnsPricing(props.offering) &&
    !hidePlanAddButton(props.offering.type, props.offering.plans) &&
    hasPermission(user, {
      permission: PermissionEnum.CREATE_OFFERING_PLAN,
      customerId: props.offering.customer_uuid,
    });

  const tableTabs = useOfferingAccountingTableTabs(props.offering);

  const ExpandableRow = useCallback(
    ({ row }) => (
      <PlanExpandableRow row={row} components={props.offering.components} />
    ),
    [props.offering.components],
  );

  return (
    <Table<Plan>
      {...tableProps}
      columns={columns}
      title={translate('Accounting')}
      verboseName={translate('plans')}
      tabs={tableTabs}
      tableActions={
        <>
          <FilteredEventsButton
            filter={{
              feature: 'offering_accounting',
              scope: props.offering.url,
            }}
          />

          {canCreatePlan && (
            <AddPlanButton
              refetch={tableProps.fetch}
              offering={props.offering}
            />
          )}
        </>
      }
      rowActions={({ row }) => (
        <PlanActions
          offering={props.offering}
          plan={row}
          refetch={tableProps.fetch}
          user={user}
        />
      )}
      expandableRow={ExpandableRow}
    />
  );
};
