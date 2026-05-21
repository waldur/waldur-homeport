import { FC, useEffect, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import { marketplaceResourcesList, Project } from 'waldur-js-client';

import { getInitialValues, syncFiltersToURL } from '@/core/filters';
import { PROJECT_RESOURCES_ALL_FILTER_FORM_ID } from '@/marketplace/resources/list/constants';
import { createFetcher } from '@/table/api';
import { TableProps } from '@/table/types';
import { useTable } from '@/table/useTable';

import { ResourcesAllListTable } from './ResourcesAllListTable';
import { buildResourcesAllFilter, resourcesListRequiredFields } from './utils';

interface ProjectResourcesListProps extends Partial<TableProps> {
  project: Project;
}

const ProjectResourcesListTable: FC<ProjectResourcesListProps> = (props) => {
  const { values } = useFormState();
  const filterValues: any = values;

  useEffect(() => {
    if (filterValues) {
      syncFiltersToURL(filterValues);
    }
  }, [filterValues]);

  const filter = useMemo(
    () =>
      buildResourcesAllFilter(filterValues, {
        project_uuid: props.project.uuid,
      }),
    [filterValues, props.project],
  );

  const tableProps = useTable({
    table: `ProjectResourcesList`,
    fetchData: createFetcher(marketplaceResourcesList),
    queryField: 'query',
    filter,
    mandatoryFields: resourcesListRequiredFields(),
  });

  return (
    <ResourcesAllListTable
      {...tableProps}
      {...props}
      formId={PROJECT_RESOURCES_ALL_FILTER_FORM_ID}
      context="project"
    />
  );
};

export const ProjectResourcesList: FC<ProjectResourcesListProps> = (props) => {
  const initialValues = useMemo(() => getInitialValues(), []);
  return (
    <Form
      onSubmit={() => {}}
      subscription={{ values: true }}
      initialValues={initialValues}
    >
      {() => <ProjectResourcesListTable {...props} />}
    </Form>
  );
};
