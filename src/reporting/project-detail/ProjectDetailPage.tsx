import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FC, useState, useMemo, useEffect } from 'react';
import { Col, Row } from 'react-bootstrap';
import { projectsRetrieve } from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { AsyncSelect, Select } from '@/form/select';
import { translate } from '@/i18n';
import {
  organizationAutocomplete,
  projectAutocomplete,
} from '@/marketplace/common/autocompletes';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { NoResult } from '@/navigation/header/search/NoResult';

import { ReportingTitle } from '../ReportingTitle';

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
  const loadOrganizations = useMemo(() => organizationAutocomplete(), []);

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

  const loadProjects = useMemo(
    () => projectAutocomplete(selectedOrganization?.uuid),
    [selectedOrganization?.uuid],
  );

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
          noAction
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
          noAction
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
          noAction
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
          noAction
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
      <ReportingTitle reportKey="project-detail" />
      {/* Filters */}
      <div className="d-flex flex-wrap gap-6 mb-6">
        <FormGroup
          label={translate('Organization')}
          className="flex-grow-1 mw-400px"
        >
          <AsyncSelect
            placeholder={translate('Select organization...')}
            loadOptions={loadOrganizations}
            defaultOptions
            value={selectedOrganization}
            onChange={handleOrganizationChange}
            getOptionValue={(option: OrganizationOption) => option.uuid}
            getOptionLabel={(option: OrganizationOption) => option.name}
            isClearable
            noOptionsMessage={() => translate('No organizations')}
          />
        </FormGroup>

        <FormGroup
          label={translate('Project')}
          className="flex-grow-1 mw-400px"
        >
          <AsyncSelect
            key={selectedOrganization?.uuid || 'no-org'}
            placeholder={translate('Select project...')}
            loadOptions={loadProjects}
            defaultOptions
            value={selectedProject}
            onChange={handleProjectChange}
            getOptionValue={(option: ProjectOption) => option.uuid}
            getOptionLabel={(option: ProjectOption) => option.name}
            isClearable
            isDisabled={!selectedOrganization}
            isLoading={projectLoading}
            noOptionsMessage={() => translate('No projects')}
          />
        </FormGroup>

        <FormGroup
          label={translate('Resource')}
          className="flex-grow-1 mw-400px"
        >
          <Select
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
          />
        </FormGroup>

        <FormGroup
          label={translate('Component type')}
          className="flex-grow-1 mw-300px"
        >
          <Select
            placeholder={translate('All types')}
            options={typeOptions}
            value={selectedType}
            onChange={setSelectedType}
            getOptionValue={(option) => option.value}
            getOptionLabel={(option) => option.label}
            isClearable
            isDisabled={!selectedResource || typesLoading}
            isLoading={typesLoading}
          />
        </FormGroup>
      </div>

      {/* Content */}
      {renderContent()}
    </>
  );
};
