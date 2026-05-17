import { FC, useState } from 'react';
import { OfferingComponent } from 'waldur-js-client';

import { translate } from '@/i18n';
import { showComponentsList } from '@/marketplace/common/registry';
import { getBillingTypeLabel } from '@/marketplace/resources/usage/utils';
import { STORAGE_MODE_OPTIONS, TENANT_TYPE } from '@/openstack/constants';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { OfferingSectionProps } from '../types';
import { useOfferingAccountingTableTabs } from '../utils';

import { AddComponentButton } from './AddComponentButton';
import { getLimitPeriods } from './ComponentLimitPeriodField';
import { DeleteComponentButton } from './DeleteComponentButton';
import { EditComponentButton } from './EditComponentButton';
import { SwitchModesDropdown } from './SwitchModesDropdown';

const RowActions = ({ row, refetch, offering }) => {
  return (
    <ActionsDropdownComponent>
      <EditComponentButton
        offering={offering}
        refetch={refetch}
        component={row}
      />
      {!row.is_builtin && (
        <DeleteComponentButton
          offering={offering}
          component={row}
          refetch={refetch}
        />
      )}
    </ActionsDropdownComponent>
  );
};

export const ComponentsSection: FC<OfferingSectionProps & { components }> = (
  props,
) => {
  const [firstFetch, setFirstFetch] = useState(true);

  const tableProps = useTable({
    table: 'OfferingComponents',
    fetchData: async () => {
      let freshComponents;
      if (!firstFetch) {
        const res = await props.refetch();
        freshComponents = res.data?.offering?.components;
      } else {
        setFirstFetch(false);
      }

      const rows = freshComponents || props.offering.components;
      return Promise.resolve({
        rows,
        resultCount: rows.length,
      });
    },
  });

  const tableTabs = useOfferingAccountingTableTabs(props.offering);

  if (!showComponentsList(props.offering.type)) {
    return null;
  }

  return (
    <Table<OfferingComponent>
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
        },
        {
          title: translate('Type'),
          render: ({ row }) => <>{row.type}</>,
        },
        {
          title: translate('Unit'),
          render: ({ row }) => <>{row.measured_unit}</>,
        },
        {
          title: translate('Billing type'),
          render: ({ row }) => <>{getBillingTypeLabel(row.billing_type)}</>,
        },
        {
          title: translate('Limit period'),
          render: ({ row }) => (
            <>
              {
                getLimitPeriods().find(
                  (period) => period.value === row.limit_period,
                )?.label
              }
            </>
          ),
        },
      ]}
      tabs={tableTabs}
      title={translate('Accounting')}
      subtitle={
        props.offering.type === TENANT_TYPE ? (
          <p className="mb-0">
            <strong>{translate('Storage mode')}</strong>:{' '}
            {
              STORAGE_MODE_OPTIONS.find(
                (op) =>
                  op.value ===
                  (props.offering.plugin_options?.storage_mode || 'fixed'),
              )?.label
            }
          </p>
        ) : null
      }
      verboseName={translate('Components')}
      tableActions={
        <>
          <AddComponentButton {...props} refetch={tableProps.fetch} />
          {(props.offering.components || []).length > 0 ? (
            <SwitchModesDropdown {...props} />
          ) : null}
        </>
      }
      rowActions={({ row, fetch }) => (
        <RowActions row={row} refetch={fetch} offering={props.offering} />
      )}
    />
  );
};
