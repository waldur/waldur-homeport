import { FC, useMemo } from 'react';
import { Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { formValueSelector } from 'redux-form';
import {
  marketplaceResourcesReallocateLimits,
  type ResourceReallocateLimitsRequest,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { Limits } from '@waldur/marketplace/common/types';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { REALLOCATE_LIMITS_FORM_ID } from './constants';
import { ReallocateFormData } from './types';
import { calculateFreedCapacity, FetchedData } from './utils';

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
  const formSelector = formValueSelector(REALLOCATE_LIMITS_FORM_ID);
  const limits = useSelector((state) =>
    formSelector(state, 'limits'),
  ) as Limits;
  const targets =
    (useSelector((state) => formSelector(state, 'targets')) as Array<{
      resource_uuid: string;
      resource_name?: string;
      allocated_limits: Limits;
    }>) || [];

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
      <div className="mb-4">
        {translate(
          'Please review the changes below before confirming the reallocation.',
        )}
      </div>

      <div className="table-responsive">
        <Table className="table-row-bordered table-rounded border border-gray-200">
          <thead>
            <tr>
              <th>{translate('Resource name')}</th>
              {components.map((component) => (
                <th key={component.type}>{component.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {summaryData.map((row) => (
              <tr key={row.resourceUuid}>
                <td>
                  <strong>{row.resourceName}</strong>
                </td>
                {components.map((component) => {
                  const change = row.changes[component.type] || 0;
                  return (
                    <td key={component.type}>
                      {change !== 0 ? (
                        <span
                          style={{
                            color: change > 0 ? 'green' : 'red',
                          }}
                        >
                          {change > 0 ? '+' : ''}
                          {change}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export const submitReallocation = async (
  formData: ReallocateFormData,
  context: {
    asyncState: {
      value: FetchedData;
    };
    resolve: {
      refetch?(): void;
    };
  },
  dispatch: any,
) => {
  const {
    resource,
    limitSerializer,
    limits: currentLimits,
  } = context.asyncState.value;
  const { limits: newLimits, targets } = formData;

  if (!newLimits || !targets || targets.length === 0) {
    dispatch(
      showErrorResponse(
        { detail: translate('Please complete all steps.') } as any,
        translate('Unable to reallocate limits.'),
      ),
    );
    return;
  }

  try {
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
    await marketplaceResourcesReallocateLimits({
      path: { uuid: resource.uuid },
      body: requestBody,
    });

    dispatch(
      showSuccess(
        translate('Resource limits reallocation request has been submitted.'),
      ),
    );
    dispatch(closeModalDialog());
    if (context.resolve.refetch) {
      await context.resolve.refetch();
    }
  } catch (error) {
    dispatch(
      showErrorResponse(
        error,
        translate('Unable to submit reallocation request.'),
      ),
    );
  }
};
