import { WarningCircleIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, useState, useEffect } from 'react';
import {
  Form,
  InputGroup,
  OverlayTrigger,
  Table,
  Tooltip,
} from 'react-bootstrap';

import { Badge } from '@waldur/core/Badge';
import { CaretUpDownButtons } from '@waldur/core/CaretUpDownButtons';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { Limits } from '@waldur/marketplace/common/types';

import { ResourceSelection } from './types';

const AllocationInputCell: FC<{
  resource: ResourceSelection;
  isSelected: boolean;
  currentLimit: number;
  allocated: number | undefined;
  newLimit: number;
  change: number;
  freedAmount: number;
  totalAllocated: number;
  component: { type: string; measured_unit: string };
  onAllocationChange: (
    resourceUuid: string,
    componentType: string,
    amount: number,
  ) => void;
}> = ({
  resource,
  isSelected,
  currentLimit,
  allocated,
  newLimit,
  change,
  freedAmount,
  totalAllocated,
  component,
  onAllocationChange,
}) => {
  const [localValue, setLocalValue] = useState<string>(
    allocated !== undefined && allocated !== null ? String(allocated) : '',
  );

  useEffect(() => {
    if (allocated !== undefined && allocated !== null) {
      setLocalValue(String(allocated));
    } else if (isSelected) {
      setLocalValue('0');
    } else {
      setLocalValue('');
    }
  }, [allocated, isSelected]);

  const currentAllocated = allocated || 0;
  const otherAllocated = totalAllocated - currentAllocated;
  const numericValue = parseInt(localValue, 10) || 0;
  const exceedsCapacity = numericValue + otherAllocated > freedAmount;

  const adjustValue = (amount: number) => {
    const value = parseInt(localValue, 10) || 0;
    const newValue = Math.max(0, value + amount);
    setLocalValue(String(newValue));
    onAllocationChange(resource.uuid, component.type, newValue);
  };

  return (
    <tr>
      <td>
        <div>
          <strong>{resource.name}</strong>
          <div className="text-muted small">
            {resource.customer_name} / {resource.project_name}
          </div>
        </div>
      </td>
      <td>{currentLimit}</td>
      <td>
        {isSelected ? (
          <div style={{ maxWidth: '200px' }}>
            <InputGroup className="input-group-number">
              <Form.Control
                type="number"
                min={0}
                value={localValue}
                className={classNames(exceedsCapacity && 'border-danger')}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  setLocalValue(inputValue);
                  if (inputValue === '') {
                    return;
                  }
                  const value = parseInt(inputValue, 10);
                  if (!isNaN(value) && value >= 0) {
                    onAllocationChange(resource.uuid, component.type, value);
                  }
                }}
                onBlur={(e) => {
                  const inputValue = e.target.value;
                  if (
                    inputValue === '' ||
                    inputValue === null ||
                    inputValue === undefined
                  ) {
                    setLocalValue('0');
                    onAllocationChange(resource.uuid, component.type, 0);
                  } else {
                    const value = parseInt(inputValue, 10);
                    if (!isNaN(value)) {
                      setLocalValue(String(value));
                      onAllocationChange(resource.uuid, component.type, value);
                    }
                  }
                }}
              />
              <div className="input-group-addons">
                {exceedsCapacity && (
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id={`warning-${resource.uuid}`}>
                        {translate('Allocation exceeds freed pool')}
                      </Tooltip>
                    }
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        marginRight: '8px',
                        cursor: 'help',
                        zIndex: 10,
                        position: 'relative',
                        pointerEvents: 'auto',
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <WarningCircleIcon
                        size={18}
                        weight="regular"
                        className="text-danger"
                      />
                    </span>
                  </OverlayTrigger>
                )}
                <CaretUpDownButtons
                  onClickUp={() => adjustValue(1)}
                  onClickDown={() => adjustValue(-1)}
                />
              </div>
            </InputGroup>
          </div>
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>
      <td>
        {isSelected ? (
          <span>{newLimit}</span>
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>
      <td>
        {isSelected ? (
          change === 0 ? (
            <span className="text-muted">{change}</span>
          ) : (
            <Badge variant={change > 0 ? 'success' : 'danger'} pill outline>
              {change > 0 ? `+${change}` : String(change)}
            </Badge>
          )
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>
    </tr>
  );
};

interface ResourceSelectionTableProps {
  component: {
    type: string;
    name: string;
    measured_unit: string;
  };
  resources: ResourceSelection[];
  freedAmount: number;
  targets: Array<{ resource_uuid: string; allocated_limits: Limits }>;
  onAllocationChange: (
    resourceUuid: string,
    componentType: string,
    amount: number,
  ) => void;
  loading: boolean;
}

export const ResourceSelectionTable: FC<ResourceSelectionTableProps> = ({
  component,
  resources,
  freedAmount,
  targets,
  onAllocationChange,
  loading,
}) => {
  if (loading) {
    return <LoadingSpinner />;
  }

  const totalAllocated = targets.reduce((sum, target) => {
    return sum + (target.allocated_limits[component.type] || 0);
  }, 0);

  return (
    <div>
      <div className="mb-3">
        <strong>{translate('Freed capacity')}</strong>: {freedAmount}{' '}
        {component.name}
        {component.measured_unit}
        {totalAllocated > 0 && (
          <span className="ms-3">
            <strong>{translate('Allocated')}</strong>: {totalAllocated}{' '}
            {component.measured_unit}
          </span>
        )}
      </div>

      <div className="table-responsive">
        <Table className="table-row-bordered table-expandable align-middle table-rounded border border-gray-200">
          <thead>
            <tr>
              <th>{translate('Resource name')}</th>
              <th>{translate('Current limit')}</th>
              <th>{translate('Allocated')}</th>
              <th>{translate('New limit')}</th>
              <th>{translate('Change')}</th>
            </tr>
          </thead>
          <tbody>
            {resources.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">
                  <p className="mb-0">
                    <strong>
                      {translate('No targer resources selected.')}
                    </strong>
                  </p>
                </td>
              </tr>
            ) : (
              resources.map((resource) => {
                const target = targets.find(
                  (t) => t.resource_uuid === resource.uuid,
                );
                const isSelected = !!target;
                const currentLimit = resource.limits[component.type] || 0;
                const allocated = target?.allocated_limits[component.type];
                const newLimit = currentLimit + (allocated || 0);
                const change = allocated || 0;

                return (
                  <AllocationInputCell
                    key={resource.uuid}
                    resource={resource}
                    isSelected={isSelected}
                    currentLimit={currentLimit}
                    allocated={allocated}
                    newLimit={newLimit}
                    change={change}
                    freedAmount={freedAmount}
                    totalAllocated={totalAllocated}
                    component={component}
                    onAllocationChange={onAllocationChange}
                  />
                );
              })
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};
