import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FC, useState, useMemo, useEffect } from 'react';
import { Col, Row } from 'react-bootstrap';
import Select from 'react-select';
import { projectsRetrieve } from 'waldur-js-client';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import {
  organizationAutocomplete,
  projectAutocomplete,
} from '@waldur/marketplace/common/autocompletes';
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

interface OrganizationOption {
  uuid: string;
  name: string;
}

interface ProjectOption {
  uuid: string;
  name: string;
  customer_uuid?: string;
  customer_name?: string;
}

export const ProjectDetailPage: FC = () => {
  useTitle(translate('Project Resource Detail'));
  useReportBreadcrumbs({
    category: 'resources',
    currentReport: 'project-detail',
  });

  const { params } = useCurrentStateAndParams();
  const router = useRouter();
  const projectUuid = params.project_uuid;

  // State for organization selection
  const [selectedOrganization, setSelectedOrganization] =
    useState<OrganizationOption | null>(null);

  // State for project selection
  const [selectedProject, setSelectedProject] = useState<ProjectOption | null>(
    null,
  );
  const [projectLoading, setProjectLoading] = useState(false);

  // State for filters
  const [selectedResource, setSelectedResource] =
    useState<ResourceOption | null>(null);
  const [selectedType, setSelectedType] = useState<ComponentTypeOption | null>(
    null,
  );

  // Load project details when navigating with project_uuid in URL
  useEffect(() => {
    if (
      projectUuid &&
      (!selectedProject || selectedProject.uuid !== projectUuid)
    ) {
      setProjectLoading(true);
      projectsRetrieve({
        path: { uuid: projectUuid },
        query: {
          field: ['uuid', 'name', 'customer_uuid', 'customer_name'] as any,
        },
      })
        .then((response) => {
          const project = response.data;
          setSelectedProject({
            uuid: project.uuid,
            name: project.name,
            customer_uuid: project.customer_uuid,
            customer_name: project.customer_name,
          });
          // Also set the organization
          if (project.customer_uuid && project.customer_name) {
            setSelectedOrganization({
              uuid: project.customer_uuid,
              name: project.customer_name,
            });
          }
        })
        .catch(() => {
          // If project not found, clear selection
          setSelectedProject(null);
        })
        .finally(() => {
          setProjectLoading(false);
        });
    }
  }, [projectUuid]);

  // Handle organization selection change
  const handleOrganizationChange = (org: OrganizationOption | null) => {
    setSelectedOrganization(org);
    // Reset downstream selections
    setSelectedProject(null);
    setSelectedResource(null);
    setSelectedType(null);
    router.stateService.go('reporting-project-detail', {
      project_uuid: null,
    });
  };

  // Handle project selection change
  const handleProjectChange = (project: ProjectOption | null) => {
    setSelectedProject(project);
    setSelectedResource(null);
    setSelectedType(null);
    router.stateService.go('reporting-project-detail', {
      project_uuid: project?.uuid || null,
    });
  };

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

  const hasError = limitsError || usageError;

  // Render content based on project selection state
  const renderContent = () => {
    if (!selectedOrganization) {
      return (
        <NoResult
          title={translate('Select an organization')}
          message={translate(
            'Choose an organization from the dropdown above to view its projects.',
          )}
        />
      );
    }

    if (!projectUuid) {
      return (
        <NoResult
          title={translate('Select a project')}
          message={translate(
            'Choose a project from the dropdown above to view resource usage details.',
          )}
        />
      );
    }

    if (resourcesLoading || projectLoading) {
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

    if (!selectedResource) {
      return (
        <NoResult
          title={translate('Select a resource')}
          message={translate(
            'Choose a resource from the dropdown above to view its limit and usage history.',
          )}
        />
      );
    }

    if (hasError) {
      return <LoadingErred loadData={() => window.location.reload()} />;
    }

    return (
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
    );
  };

  return (
    <>
      {/* Filters */}
      <div className="d-flex flex-wrap gap-6 mb-6">
        <FormGroup
          label={translate('Organization')}
          className="flex-grow-1 mw-400px"
        >
          <AsyncPaginate
            placeholder={translate('Select organization...')}
            loadOptions={(query, prevOptions, { page }) =>
              organizationAutocomplete(query, prevOptions, page)
            }
            defaultOptions
            value={selectedOrganization}
            onChange={handleOrganizationChange}
            getOptionValue={(option: OrganizationOption) => option.uuid}
            getOptionLabel={(option: OrganizationOption) => option.name}
            isClearable
            noOptionsMessage={() => translate('No organizations')}
            className="metronic-select-container"
            classNamePrefix="metronic-select"
          />
        </FormGroup>

        <FormGroup
          label={translate('Project')}
          className="flex-grow-1 mw-400px"
        >
          <AsyncPaginate
            key={selectedOrganization?.uuid || 'no-org'}
            placeholder={translate('Select project...')}
            loadOptions={(query, prevOptions, { page }) =>
              projectAutocomplete(
                selectedOrganization?.uuid,
                query,
                prevOptions,
                page,
              )
            }
            defaultOptions
            value={selectedProject}
            onChange={handleProjectChange}
            getOptionValue={(option: ProjectOption) => option.uuid}
            getOptionLabel={(option: ProjectOption) => option.name}
            isClearable
            isDisabled={!selectedOrganization}
            isLoading={projectLoading}
            noOptionsMessage={() => translate('No projects')}
            className="metronic-select-container"
            classNamePrefix="metronic-select"
          />
        </FormGroup>

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
            isDisabled={!projectUuid || resourcesLoading}
            isLoading={resourcesLoading}
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

      {/* Content */}
      {renderContent()}
    </>
  );
};
