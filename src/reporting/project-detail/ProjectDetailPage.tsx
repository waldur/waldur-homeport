import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, useState, useMemo, useEffect } from 'react';
import { Col, Row } from 'react-bootstrap';
import Select from 'react-select';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { useTitle } from '@waldur/navigation/title';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { ResourceLimitsHistoryChart } from './ResourceLimitsHistoryChart';
import { ResourceUsageHistoryChart } from './ResourceUsageHistoryChart';
import { ResourceOption, ComponentTypeOption } from './types';
import {
  useProjectResources,
  useResourceOfferingComponents,
  useResourceComponentTypes,
  useResourceLimitsHistory,
  useResourceUsageHistory,
} from './useResourceHistory';

export const ProjectDetailPage: FC = () => {
  useTitle(translate('Project Resource Detail'));
  useReportBreadcrumbs({
    category: 'resources',
    currentReport: 'project-detail',
  });

  const { params } = useCurrentStateAndParams();
  const projectUuid = params.project_uuid;

  // State for filters
  const [selectedResource, setSelectedResource] =
    useState<ResourceOption | null>(null);
  const [selectedType, setSelectedType] = useState<ComponentTypeOption | null>(
    null,
  );

  // Fetch resources for the project
  const {
    data: resources,
    isLoading: resourcesLoading,
    error: resourcesError,
    refetch: refetchResources,
  } = useProjectResources(projectUuid);

  // Fetch offering components for label map
  const { data: offeringData } = useResourceOfferingComponents(
    selectedResource?.uuid,
  );
  const labelMap = offeringData?.labelMap;

  // Fetch component types for selected resource
  const { data: componentTypes, isLoading: typesLoading } =
    useResourceComponentTypes(selectedResource?.uuid);

  // Fetch limit history
  const {
    data: limitsHistory,
    isLoading: limitsLoading,
    error: limitsError,
  } = useResourceLimitsHistory({
    resourceUuid: selectedResource?.uuid,
    componentType: selectedType?.value,
    enabled: !!selectedResource?.uuid,
  });

  // Fetch usage history
  const {
    data: usageHistory,
    isLoading: usageLoading,
    error: usageError,
  } = useResourceUsageHistory({
    resourceUuid: selectedResource?.uuid,
    componentType: selectedType?.value,
    enabled: !!selectedResource?.uuid,
  });

  // Resource select options
  const resourceOptions = useMemo(() => {
    if (!resources) return [];
    return resources.map((r) => ({
      ...r,
      label: `${r.name} (${r.uuid.substring(0, 8)}...)`,
    }));
  }, [resources]);

  // Component type select options
  const typeOptions = useMemo(() => {
    if (!componentTypes) return [];
    return componentTypes;
  }, [componentTypes]);

  // Auto-select first resource if only one exists
  useEffect(() => {
    if (resourceOptions.length === 1 && !selectedResource) {
      setSelectedResource(resourceOptions[0]);
    }
  }, [resourceOptions, selectedResource]);

  // Reset type selection when resource changes
  useEffect(() => {
    setSelectedType(null);
  }, [selectedResource?.uuid]);

  if (!projectUuid) {
    return (
      <NoResult
        title={translate('Project not specified')}
        message={translate(
          'Navigate to this page from the Organization Summary report by clicking on a project.',
        )}
      />
    );
  }

  if (resourcesLoading) {
    return <LoadingSpinner />;
  }

  if (resourcesError) {
    return <LoadingErred loadData={refetchResources} />;
  }

  if (!resources || resources.length === 0) {
    return (
      <NoResult
        title={translate('No resources found')}
        message={translate(
          'This project has no resources with allocated limits.',
        )}
      />
    );
  }

  const hasError = limitsError || usageError;

  return (
    <>
      {/* Filters */}
      <div className="d-flex flex-wrap gap-6 mb-6">
        <FormGroup
          label={translate('Resource')}
          className="flex-grow-1 mw-400px"
        >
          <Select<ResourceOption>
            placeholder={translate('Select resource...')}
            options={resourceOptions}
            value={selectedResource}
            onChange={setSelectedResource}
            getOptionValue={(option) => option.uuid}
            getOptionLabel={(option) =>
              `${option.name} (${option.uuid.substring(0, 8)}...)`
            }
            isClearable
            className="metronic-select-container"
            classNamePrefix="metronic-select"
          />
        </FormGroup>

        <FormGroup
          label={translate('Component type')}
          className="flex-grow-1 mw-300px"
        >
          <Select<ComponentTypeOption>
            placeholder={translate('All types')}
            options={typeOptions}
            value={selectedType}
            onChange={setSelectedType}
            getOptionValue={(option) => option.value}
            getOptionLabel={(option) => option.label}
            isClearable
            isDisabled={!selectedResource || typesLoading}
            isLoading={typesLoading}
            className="metronic-select-container"
            classNamePrefix="metronic-select"
          />
        </FormGroup>
      </div>

      {/* Charts */}
      {selectedResource ? (
        hasError ? (
          <LoadingErred loadData={() => window.location.reload()} />
        ) : (
          <Row className="g-4">
            <Col xs={12} lg={6}>
              <ResourceLimitsHistoryChart
                data={limitsHistory || []}
                componentType={selectedType?.value}
                labelMap={labelMap}
                isLoading={limitsLoading}
              />
            </Col>
            <Col xs={12} lg={6}>
              <ResourceUsageHistoryChart
                data={usageHistory || []}
                componentType={selectedType?.value}
                labelMap={labelMap}
                isLoading={usageLoading}
              />
            </Col>
          </Row>
        )
      ) : (
        <NoResult
          title={translate('Select a resource')}
          message={translate(
            'Choose a resource from the dropdown above to view its limit and usage history.',
          )}
        />
      )}
    </>
  );
};
