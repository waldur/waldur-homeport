import { FC, useEffect, useMemo, useState } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { change, formValueSelector } from 'redux-form';
import { Resource } from 'waldur-js-client';

import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { resourceAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { getFormLimitParser } from '@waldur/marketplace/common/registry';
import { Limits } from '@waldur/marketplace/common/types';
import { formatResourceShort } from '@waldur/marketplace/utils';

import { FetchedData } from '../change-limits/utils';

import { REALLOCATE_LIMITS_FORM_ID } from './constants';
import { ResourceSelectionTable } from './ResourceSelectionTable';
import { ResourceSelection } from './types';
import { calculateFreedCapacity } from './utils';

interface ReallocateCapacityTabProps {
  context: {
    asyncState: {
      value: FetchedData;
    };
  };
}

export const ReallocateCapacityTab: FC<ReallocateCapacityTabProps> = ({
  context,
}) => {
  const dispatch = useDispatch();
  const [selectedResources, setSelectedResources] = useState<Resource[]>([]);
  const [activeComponentTab, setActiveComponentTab] = useState<string>('');

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
  const limitParser = useMemo(
    () => getFormLimitParser(offering?.type || ''),
    [offering?.type],
  );

  const freedCapacity = useMemo(() => {
    if (!limits) return {};
    return calculateFreedCapacity(currentLimits, limits);
  }, [currentLimits, limits]);

  const components = useMemo(() => {
    if (!offering) return [];
    return (offering.components || [])
      .filter(
        (c) =>
          c.billing_type === 'limit' && c.type && freedCapacity[c.type] > 0,
      )
      .map((c) => ({
        type: c.type!,
        name: c.name || '',
        measured_unit: c.measured_unit || '',
      }));
  }, [offering, freedCapacity]);

  useEffect(() => {
    if (components.length > 0 && !activeComponentTab) {
      setActiveComponentTab(components[0].type);
    }
  }, [components, activeComponentTab]);

  const resources: ResourceSelection[] = useMemo(() => {
    return selectedResources.map((r: Resource) => ({
      uuid: r.uuid,
      name: r.name,
      offering_name: r.offering_name || '',
      customer_name: r.customer_name || '',
      project_name: r.project_name || '',
      limits: limitParser(r.limits || {}),
      current_usages: limitParser(r.current_usages || {}),
    }));
  }, [selectedResources, limitParser]);

  useEffect(() => {
    const currentTargets = targets || [];
    const selectedUuids = new Set(selectedResources.map((r) => r.uuid));
    const targetUuids = new Set(currentTargets.map((t) => t.resource_uuid));

    // Add new selections
    selectedResources.forEach((r) => {
      if (!targetUuids.has(r.uuid)) {
        const initialAllocatedLimits: Limits = {};
        components.forEach((component) => {
          if (freedCapacity[component.type] > 0) {
            initialAllocatedLimits[component.type] = 0;
          }
        });

        dispatch(
          change(REALLOCATE_LIMITS_FORM_ID, 'targets', [
            ...currentTargets,
            {
              resource_uuid: r.uuid,
              resource_name: r.name,
              allocated_limits: initialAllocatedLimits,
            },
          ]),
        );
      }
    });

    const toRemove = currentTargets.filter(
      (t) => !selectedUuids.has(t.resource_uuid),
    );
    if (toRemove.length > 0) {
      dispatch(
        change(
          REALLOCATE_LIMITS_FORM_ID,
          'targets',
          currentTargets.filter((t) => selectedUuids.has(t.resource_uuid)),
        ),
      );
    }
  }, [selectedResources, targets, dispatch]);

  const handleAllocationChange = (
    resourceUuid: string,
    componentType: string,
    amount: number,
  ) => {
    const currentTargets = targets || [];
    const targetIndex = currentTargets.findIndex(
      (t) => t.resource_uuid === resourceUuid,
    );

    if (targetIndex >= 0) {
      const updatedTargets = [...currentTargets];
      updatedTargets[targetIndex] = {
        ...updatedTargets[targetIndex],
        allocated_limits: {
          ...updatedTargets[targetIndex].allocated_limits,
          [componentType]: amount,
        },
      };
      dispatch(change(REALLOCATE_LIMITS_FORM_ID, 'targets', updatedTargets));
    }
  };

  if (components.length === 0) {
    return (
      <div className="alert alert-info">
        {translate(
          'No capacity will be freed with the current limit changes. Please adjust limits in the previous step.',
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <label className="form-label mb-2">
          {translate('Find target resource(s)')}
        </label>
        <AsyncPaginate
          placeholder={translate('Search and select resources...')}
          loadOptions={async (query, prevOptions, { page }) => {
            const result = await resourceAutocomplete(
              {
                offering_uuid: [offering.uuid],
                state: ['OK'],
                name: query,
                field: [
                  'uuid',
                  'name',
                  'offering_name',
                  'customer_name',
                  'project_name',
                  'limits',
                  'current_usages',
                ],
              },
              prevOptions,
              page,
            );
            return {
              ...result,
              options: result.options.filter(
                (option: Resource) => option.uuid !== resource.uuid,
              ),
            };
          }}
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => formatResourceShort(option)}
          value={selectedResources.filter(
            (r: Resource) => r.uuid !== resource.uuid,
          )}
          onChange={(value) => {
            const filtered = (value || []).filter(
              (r: Resource) => r.uuid !== resource.uuid,
            );
            setSelectedResources(filtered);
          }}
          noOptionsMessage={() => translate('No resources found')}
          isClearable={true}
          isMulti={true}
          defaultOptions
          className="metronic-select-container"
          classNamePrefix="metronic-select"
        />
        <div className="form-text mt-2">
          {translate(
            'Search and select resources, adjust allocations in the table.',
          )}
        </div>
      </div>

      {components.length === 1 ? (
        <ResourceSelectionTable
          component={components[0]}
          resources={resources}
          freedAmount={freedCapacity[components[0].type] || 0}
          targets={targets || []}
          onAllocationChange={handleAllocationChange}
          loading={false}
        />
      ) : (
        <Tab.Container
          activeKey={activeComponentTab}
          onSelect={(key) => setActiveComponentTab(key as string)}
        >
          <Nav variant="tabs" className="nav-line-tabs mb-4">
            {components.map((component) => (
              <Nav.Item key={component.type}>
                <Nav.Link eventKey={component.type}>{component.name}</Nav.Link>
              </Nav.Item>
            ))}
          </Nav>

          <Tab.Content>
            {components.map((component) => (
              <Tab.Pane key={component.type} eventKey={component.type}>
                <ResourceSelectionTable
                  component={component}
                  resources={resources}
                  freedAmount={freedCapacity[component.type] || 0}
                  targets={targets || []}
                  onAllocationChange={handleAllocationChange}
                  loading={false}
                />
              </Tab.Pane>
            ))}
          </Tab.Content>
        </Tab.Container>
      )}
    </div>
  );
};
