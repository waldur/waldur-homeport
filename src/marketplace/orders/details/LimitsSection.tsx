import { XIcon } from '@phosphor-icons/react';
import { isEmpty } from 'lodash-es';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, FormCheck, Stack } from 'react-bootstrap';
import {
  OrderDetails,
  PublicOfferingDetails,
  OfferingComponent,
} from 'waldur-js-client';

import { CompactIconButton } from '@/core/buttons/IconButton';
import { EditAction } from '@/form/EditAction';
import { translate } from '@/i18n';
import { Limits } from '@/marketplace/common/types';
import { useModal } from '@/modal/actions';
import { NoResult } from '@/navigation/header/search/NoResult';
import { ActionDropdownButton } from '@/table/ActionDropdownButton';
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

  if (components.length === 0 || isEmpty(limits)) {
    return (
      <Card className="card-bordered">
        <Card.Header className="custom-card-header custom-padding-zero">
          <Card.Title>
            <h3>{translate('Limits')}</h3>
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <NoResult
            title={translate('No limits found for this order')}
            buttonTitle={null}
            message={null}
            noAction
          />
        </Card.Body>
      </Card>
    );
  }
  return (
    <Card className="card-bordered">
      <Card.Header className="custom-card-header custom-padding-zero">
        <Card.Title>
          <h3>{translate('Limits')}</h3>
        </Card.Title>
        {editable && hasSelection && (
          <div className="card-toolbar d-flex align-items-center gap-3">
            <Stack direction="horizontal" className="fw-normal text-dark">
              <CompactIconButton
                iconNode={<XIcon weight="bold" />}
                tooltip={translate('Clear selection')}
                onClick={clearSelection}
                variant="text-secondary"
                className="me-1"
              />
              <span>
                ({selectedRows.length}) {translate('Selected')}
              </span>
            </Stack>
            <ActionDropdownButton
              variant="primary"
              title={translate('All actions')}
            >
              <EditAction action={openBulkEditDialog} />
            </ActionDropdownButton>
          </div>
        )}
      </Card.Header>
      <Card.Body>
        <table className="table align-middle table-row-bordered fs-6 gy-4 no-footer">
          <thead>
            <tr className="align-middle">
              {editable && (
                <th
                  style={{
                    width: '10px',
                    paddingLeft: '16px',
                    paddingRight: 0,
                  }}
                >
                  <FormCheck
                    ref={headerCheckRef}
                    data-testid="select-all"
                    className="form-check form-check-custom form-check-md"
                    checked={isAllSelected}
                    onChange={toggleAll}
                  />
                </th>
              )}
              <th>{translate('Name')}</th>
              <th>{translate('Measured unit')}</th>
              <th>{translate('Limit')}</th>
              {editable && (
                <th className="header-actions">{translate('Actions')}</th>
              )}
            </tr>
          </thead>

          <tbody>
            {components.map((component, id) => (
              <tr key={id}>
                {editable && (
                  <td style={{ paddingLeft: '16px', paddingRight: 0 }}>
                    <FormCheck
                      className="form-check form-check-custom form-check-md"
                      checked={selected.includes(component.type)}
                      onChange={() => toggleOne(component.type)}
                    />
                  </td>
                )}
                <td className="text-capitalize">{component.name}</td>
                <td className="text-capitalize">{component.measured_unit}</td>
                <td className="text-capitalize">
                  {component.is_boolean
                    ? limits[component.type]
                      ? translate('Enabled')
                      : translate('Disabled')
                    : limits[component.type]}
                </td>
                {editable && (
                  <td>
                    <ActionsDropdown size="sm">
                      <EditAction
                        action={() => openSingleEditDialog(component.type)}
                      />
                    </ActionsDropdown>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card.Body>
    </Card>
  );
};
