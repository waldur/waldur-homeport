import { FC, FocusEvent, useState, useEffect } from 'react';

import { Badge, NumberInput, Tooltip } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { Limits } from '@/marketplace/common/types';

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
  rowTestId?: string;
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
  rowTestId,
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

  const handleValue = (next: string | number) => {
    const inputValue = String(next);
    setLocalValue(inputValue);
    if (inputValue === '') {
      return;
    }
    const value = parseInt(inputValue, 10);
    if (!isNaN(value) && value >= 0) {
      onAllocationChange(resource.uuid, component.type, value);
    }
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '' || inputValue === null || inputValue === undefined) {
      setLocalValue('0');
      onAllocationChange(resource.uuid, component.type, 0);
    } else {
      const value = parseInt(inputValue, 10);
      if (!isNaN(value)) {
        setLocalValue(String(value));
        onAllocationChange(resource.uuid, component.type, value);
      }
    }
  };

  const allocationInput = (
    <NumberInput
      id={`allocation-${resource.uuid}`}
      data-testid={`allocation-${resource.uuid}`}
      name={`allocation-${resource.uuid}`}
      aria-label={translate('Allocation for {resource}', {
        resource: resource.name,
      })}
      min={0}
      value={localValue}
      invalid={exceedsCapacity}
      onValueChange={handleValue}
      onBlur={handleBlur}
    />
  );

  return (
    <tr data-testid={rowTestId}>
      <td>
        <div>
          <strong>{resource.name}</strong>
          <div className="text-quaternary small">
            {resource.customer_name} / {resource.project_name}
          </div>
        </div>
      </td>
      <td>{currentLimit}</td>
      <td>
        {isSelected ? (
          <div style={{ maxWidth: '200px' }}>
            {/* Always wrapped: swapping the wrapper in and out would remount
                the input and drop focus mid-typing. */}
            <Tooltip
              alwaysMount
              label={
                exceedsCapacity
                  ? translate('Allocation exceeds freed pool')
                  : undefined
              }
            >
              <div>{allocationInput}</div>
            </Tooltip>
          </div>
        ) : (
          <span className="text-quaternary">—</span>
        )}
      </td>
      <td>
        {isSelected ? (
          <span>{newLimit}</span>
        ) : (
          <span className="text-quaternary">—</span>
        )}
      </td>
      <td>
        {isSelected ? (
          change === 0 ? (
            <span className="text-quaternary">{change}</span>
          ) : (
            <Badge
              variant={change > 0 ? 'success' : 'danger'}
              shape="pill"
              tone="outline"
            >
              {change > 0 ? `+${change}` : String(change)}
            </Badge>
          )
        ) : (
          <span className="text-quaternary">—</span>
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
      <div className="mb-2.5">
        <strong>{translate('Freed capacity')}</strong>: {freedAmount}{' '}
        {component.name} {component.measured_unit}
        {totalAllocated > 0 && (
          <span className="ms-2.5">
            <strong>{translate('Allocated')}</strong>: {totalAllocated}{' '}
            {component.measured_unit}
          </span>
        )}
      </div>

      <div className="table-responsive">
        <table className="table table-row-bordered table-expandable align-middle table-rounded border-[1px] border-divider">
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
                    rowTestId={`row-${resource.uuid}`}
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
        </table>
      </div>
    </div>
  );
};
