import { FC, useMemo } from 'react';
import { useFormState } from 'react-final-form';
import {
  marketplaceResourcesReallocateLimits,
  type ResourceReallocateLimitsRequest,
} from 'waldur-js-client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { translate } from '@/i18n';
import { Limits } from '@/marketplace/common/types';

import { FetchedData } from '../change-limits/utils';

import { ReallocateFormData } from './types';
import { calculateFreedCapacity } from './utils';

interface ReviewAndConfirmTabProps {
  context: {
    asyncState: {
      value: FetchedData;
    };
    resolve: {
      refetch?(): void;
    };
  };
}

export const ReviewAndConfirmTab: FC<ReviewAndConfirmTabProps> = ({
  context,
}) => {
  const { values } = useFormState<ReallocateFormData>();
  const limits = values.limits;
  const targets = values.targets || [];

  const {
    resource,
    offering,
    limits: currentLimits,
  } = context.asyncState.value;

  const components = useMemo(() => {
    if (!offering) return [];
    return (offering.components || []).filter(
      (c) => c.billing_type === 'limit',
    );
  }, [offering]);

  const summaryData = useMemo(() => {
    const data: Array<{
      resourceName: string;
      resourceUuid: string;
      changes: Record<string, number>;
    }> = [];

    // Add source resource
    data.push({
      resourceName: resource.name,
      resourceUuid: resource.uuid,
      changes: Object.fromEntries(
        components.map((c) => [
          c.type,
          (limits?.[c.type] || 0) - (currentLimits[c.type] || 0),
        ]),
      ),
    });

    if (targets) {
      targets.forEach((target) => {
        const changes: Record<string, number> = {};
        components.forEach((c) => {
          const allocated = target.allocated_limits[c.type] || 0;
          if (allocated > 0) {
            changes[c.type] = allocated;
          }
        });
        if (Object.keys(changes).length > 0) {
          data.push({
            resourceName:
              target.resource_name || `Resource ${target.resource_uuid}`,
            resourceUuid: target.resource_uuid,
            changes,
          });
        }
      });
    }

    return data;
  }, [resource, targets, components, limits, currentLimits]);

  return (
    <div>
      <div className="mb-3">
        {translate(
          'Please review the changes below before confirming the reallocation.',
        )}
      </div>

      <Table density="compact">
        <TableHeader>
          <TableRow>
            <TableHead>{translate('Resource name')}</TableHead>
            {components.map((component) => (
              <TableHead key={component.type}>{component.name}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {summaryData.map((row) => (
            <TableRow
              key={row.resourceUuid}
              data-testid={`summary-row-${row.resourceUuid}`}
            >
              <TableCell>
                <strong>{row.resourceName}</strong>
              </TableCell>
              {components.map((component) => {
                const change = row.changes[component.type] || 0;
                return (
                  <TableCell key={component.type}>
                    {change !== 0 ? (
                      <span
                        className={change > 0 ? 'text-success' : 'text-danger'}
                      >
                        {change > 0 ? '+' : ''}
                        {change}
                      </span>
                    ) : (
                      <span className="text-quaternary">—</span>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export const reallocateLimits = async (
  formData: ReallocateFormData,
  asyncState: FetchedData,
) => {
  const { limitSerializer, limits: currentLimits, resource } = asyncState;
  const { limits: newLimits, targets } = formData;

  if (!newLimits || !targets || targets.length === 0) {
    throw new Error(translate('Please complete all steps.'));
  }

  const freedCapacity = calculateFreedCapacity(currentLimits, newLimits);

  const limitsToReallocate: Limits = {};
  Object.keys(freedCapacity).forEach((key) => {
    if (freedCapacity[key] > 0) {
      limitsToReallocate[key] = freedCapacity[key];
    }
  });

  const serializedFreedLimits = limitSerializer(limitsToReallocate);

  const preparedTargets = targets.map((target) => {
    const allocatedLimits: Limits = {};
    Object.keys(target.allocated_limits).forEach((key) => {
      const amount = target.allocated_limits[key];
      if (amount > 0) {
        allocatedLimits[key] = amount;
      }
    });
    return {
      resource_uuid: target.resource_uuid,
      allocated_limits: limitSerializer(allocatedLimits),
    };
  });

  const requestBody: ResourceReallocateLimitsRequest = {
    limits: serializedFreedLimits,
    targets: preparedTargets,
  };
  return await marketplaceResourcesReallocateLimits({
    path: { uuid: resource.uuid },
    body: requestBody,
  });
};
