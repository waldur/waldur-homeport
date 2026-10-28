import { PencilSimpleIcon, XIcon } from '@phosphor-icons/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  OrderDetails,
  PublicOfferingDetails,
  OfferingComponent,
} from 'waldur-js-client';

import {
  BaseButton,
  Checkbox,
  Menu,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { EditAction } from '@/form/EditAction';
import { translate } from '@/i18n';
import { Limits } from '@/marketplace/common/types';
import { useModal } from '@/modal/actions';
import { NoResult } from '@/navigation/header/search/NoResult';
import { ActionsDropdown } from '@/table/ActionsDropdown';

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
  const [selected, setSelected] = useState<string[]>([]);

  const isAllSelected =
    components.length > 0 && selected.length >= components.length;
  const hasSelection = selected.length > 0;

  const headerCheckRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (headerCheckRef.current) {
      headerCheckRef.current.indeterminate = hasSelection && !isAllSelected;
    }
  }, [hasSelection, isAllSelected]);

  const toggleAll = () => {
    setSelected(isAllSelected ? [] : components.map((c) => c.type));
  };

  const toggleOne = (type: string) => {
    setSelected((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const clearSelection = () => setSelected([]);

  const openBulkEditDialog = () => {
    openDialog(EditOrderFieldDialog, {
      resolve: {
        order,
        offering,
        name: 'limits',
        selectedComponents: selected,
      },
      initialValues: { limits: order.limits },
      size: 'lg',
    });
  };

  const openSingleEditDialog = (componentType: string) => {
    openDialog(EditOrderFieldDialog, {
      resolve: {
        order,
        offering,
        name: 'limits',
        component: componentType,
      },
      initialValues: { limits: order.limits },
      size: 'lg',
    });
  };

  const selectedRows = useMemo(
    () => components.filter((c) => selected.includes(c.type)),
    [components, selected],
  );

  if (components.length === 0 || !Object.keys(limits ?? {}).length) {
    return (
      <div className="card card-bordered">
        <div className="card-header custom-card-header custom-padding-zero">
          <div className="card-title">
            <h3>{translate('Limits')}</h3>
          </div>
        </div>
        <div className="card-body">
          <NoResult
            title={translate('No limits found for this order')}
            buttonTitle={null}
            message={null}
            noAction
          />
        </div>
      </div>
    );
  }
  return (
    <div className="card card-bordered">
      <div className="card-header custom-card-header custom-padding-zero">
        <div className="card-title">
          <h3>{translate('Limits')}</h3>
        </div>
        {editable && hasSelection && (
          <div className="card-toolbar flex items-center gap-2.5">
            <div className="flex items-center self-stretch font-normal text-primary">
              <BaseButton
                iconNode={<XIcon weight="bold" />}
                tooltip={translate('Clear selection')}
                onClick={clearSelection}
                variant="text-secondary"
                className="me-1"
                size="sm"
              />
              <span>
                ({selectedRows.length}) {translate('Selected')}
              </span>
            </div>
            <Menu>
              <Menu.TriggerButton variant="primary">
                {translate('All actions')}
              </Menu.TriggerButton>
              <Menu.Content look="actions" side="bottom">
                <Menu.Item
                  icon={<PencilSimpleIcon weight="bold" />}
                  onSelect={openBulkEditDialog}
                >
                  {translate('Edit')}
                </Menu.Item>
              </Menu.Content>
            </Menu>
          </div>
        )}
      </div>
      <div className="card-body">
        <Table density="normal">
          <TableHeader>
            <TableRow>
              {editable && (
                <TableHead
                  style={{
                    width: '10px',
                    paddingLeft: '16px',
                    paddingRight: 0,
                  }}
                >
                  <Checkbox
                    ref={headerCheckRef}
                    data-testid="select-all"
                    aria-label={translate('Select all components')}
                    checked={isAllSelected}
                    onChange={toggleAll}
                  />
                </TableHead>
              )}
              <TableHead>{translate('Name')}</TableHead>
              <TableHead>{translate('Measured unit')}</TableHead>
              <TableHead>{translate('Limit')}</TableHead>
              {editable && (
                <TableHead className="header-actions">
                  {translate('Actions')}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {components.map((component, id) => (
              <TableRow key={id}>
                {editable && (
                  <TableCell style={{ paddingLeft: '16px', paddingRight: 0 }}>
                    <Checkbox
                      aria-label={component.name}
                      checked={selected.includes(component.type)}
                      onChange={() => toggleOne(component.type)}
                    />
                  </TableCell>
                )}
                <TableCell className="capitalize font-medium text-primary">
                  {component.name}
                </TableCell>
                <TableCell className="capitalize">
                  {component.measured_unit}
                </TableCell>
                <TableCell className="capitalize">
                  {component.is_boolean
                    ? limits[component.type]
                      ? translate('Enabled')
                      : translate('Disabled')
                    : limits[component.type]}
                </TableCell>
                {editable && (
                  <TableCell>
                    <ActionsDropdown size="sm">
                      <EditAction
                        action={() => openSingleEditDialog(component.type)}
                      />
                    </ActionsDropdown>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
