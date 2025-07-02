import { FC, useState } from 'react';

import { translate } from '@waldur/i18n';
import { showComponentsList } from '@waldur/marketplace/common/registry';
import { ValidationIcon } from '@waldur/marketplace/common/ValidationIcon';
import { getBillingTypeLabel } from '@waldur/marketplace/resources/usage/utils';
import { STORAGE_MODE_OPTIONS, TENANT_TYPE } from '@waldur/openstack/constants';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { OfferingSectionProps } from '../types';
import { useOfferingAccountingTableTabs } from '../utils';

import { AddComponentButton } from './AddComponentButton';
import { ChangeStorageModeButton } from './ChangeStorageModeButton';
import { DeleteComponentButton } from './DeleteComponentButton';
import { EditComponentButton } from './EditComponentButton';

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

      return Promise.resolve({
        rows: freshComponents || props.offering.components,
      });
    },
  });

  const tableTabs = useOfferingAccountingTableTabs(props.offering);

  if (!showComponentsList(props.offering.type)) {
    return null;
  }

  return (
    <Table
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
      ]}
      tabs={tableTabs}
      title={
        <>
          <ValidationIcon value={props.offering.components.length > 0} />
          <span className="me-2">{translate('Accounting')}</span>
        </>
      }
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
          {!props.components.length && <AddComponentButton {...props} />}
          {props.offering.type === TENANT_TYPE ? (
            <ChangeStorageModeButton {...props} />
          ) : null}
        </>
      }
      rowActions={({ row }) => (
        <>
          <EditComponentButton
            offering={props.offering}
            refetch={tableProps.fetch}
            component={row}
          />

          <DeleteComponentButton offering={props.offering} component={row} />
        </>
      )}
    />
  );
};
