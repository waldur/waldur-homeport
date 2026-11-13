import { PencilSimpleIcon } from '@phosphor-icons/react';
import {
  OrderDetails,
  PublicOfferingDetails,
  OfferingComponent,
} from 'waldur-js-client';

import { Menu } from 'waldur-ui';

import { EditAction } from '@/form/EditAction';
import { translate } from '@/i18n';
import { Limits } from '@/marketplace/common/types';
import { useModal } from '@/modal/actions';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { EditOrderFieldDialog } from './EditOrderFieldDialog';
import { useOrderEditable } from './hooks';

export const LimitsSection = ({
  components,
  limits,
  order,
  offering,
}: {
  components: OfferingComponent[];
  limits: Limits;
  order?: OrderDetails;
  offering?: PublicOfferingDetails;
}) => {
  const editable = useOrderEditable(order);
  const { openDialog } = useModal();
  const hasLimits = Object.keys(limits ?? {}).length > 0;
  const rows = hasLimits ? components : [];

  const tableProps = useTable<OfferingComponent>({
    table: `order-limits-${order?.uuid}`,
    fetchData: () => Promise.resolve({ rows, resultCount: rows.length }),
  });

  const openEditDialog = (extra: Record<string, any>) =>
    openDialog(EditOrderFieldDialog, {
      resolve: { order, offering, name: 'limits', ...extra },
      initialValues: { limits: order.limits },
      size: 'lg',
    });

  return (
    <Table<OfferingComponent>
      {...tableProps}
      rowKey="type"
      title={translate('Limits')}
      verboseName={translate('limits')}
      emptyMessage={translate('No limits found for this order')}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => (
            <span className="capitalize font-medium text-primary">
              {row.name}
            </span>
          ),
        },
        {
          title: translate('Measured unit'),
          render: ({ row }) => (
            <span className="capitalize">{row.measured_unit}</span>
          ),
        },
        {
          title: translate('Limit'),
          render: ({ row }) => (
            <span className="capitalize">
              {row.is_boolean
                ? limits[row.type]
                  ? translate('Enabled')
                  : translate('Disabled')
                : limits[row.type]}
            </span>
          ),
        },
      ]}
      enableMultiSelect={editable}
      multiSelectActions={
        editable
          ? ({ rows: selected }) => (
              <Menu>
                <Menu.TriggerButton variant="primary">
                  {translate('All actions')}
                </Menu.TriggerButton>
                <Menu.Content look="actions" side="bottom">
                  <Menu.Item
                    icon={<PencilSimpleIcon weight="bold" />}
                    onSelect={() =>
                      openEditDialog({
                        selectedComponents: selected.map((c) => c.type),
                      })
                    }
                  >
                    {translate('Edit')}
                  </Menu.Item>
                </Menu.Content>
              </Menu>
            )
          : undefined
      }
      rowActions={
        editable
          ? ({ row }) => (
              <ActionsDropdown size="sm">
                <EditAction
                  action={() => openEditDialog({ component: row.type })}
                />
              </ActionsDropdown>
            )
          : undefined
      }
      hasQuery={false}
      hasPagination={false}
      hoverShadow={false}
      placeholderHasRetry={false}
      minHeight="auto"
    />
  );
};
