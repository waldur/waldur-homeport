import { FC, useEffect, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import { marketplaceResourcesList, Project } from 'waldur-js-client';

import { getInitialValues, syncFiltersToURL } from '@/core/filters';
import { translate } from '@/i18n';
import {
  ALL_RESOURCES_TABLE_ID,
  PROJECT_RESOURCES_ALL_FILTER_FORM_ID,
} from '@/marketplace/resources/list/constants';
import { useOrganizationAndProjectFiltersForResources } from '@/navigation/sidebar/resources-filter/utils';
import { useTitle } from '@/navigation/title';
import { createFetcher } from '@/table/api';
import { TableProps } from '@/table/types';
import { useTable } from '@/table/useTable';

import { ResourcesAllListTable } from './ResourcesAllListTable';
import { buildResourcesAllFilter, resourcesListRequiredFields } from './utils';

export const mapStateToFilter = () => ({});

interface AllResourcesListProps extends Partial<TableProps> {
  project?: Project;
}

const AllResourcesListTable: FC<AllResourcesListProps> = (props) => {
  useTitle(translate('All resources'), '', 'browser');
  const { syncResourceFilters } =
    useOrganizationAndProjectFiltersForResources('all-resources');

  const { values } = useFormState();
  const filterValues: any = values;

  useEffect(() => {
    if (filterValues) {
      syncFiltersToURL(filterValues);
    }
  }, [filterValues]);

  const filter = useMemo(
    () => buildResourcesAllFilter(filterValues),
    [filterValues],
  );

  const tableProps = useTable({
    table: ALL_RESOURCES_TABLE_ID,
    fetchData: createFetcher(marketplaceResourcesList),
    queryField: 'query',
    filter,
    onApplyFilter: (filters) => {
      const organization = filters.find((item) => item.name === 'organization');
      const project = filters.find((item) => item.name === 'project');
      const formValues = {
        organization: organization?.value,
        project: project?.value,
      };
      syncResourceFilters(formValues);
    },
    mandatoryFields: resourcesListRequiredFields(),
  });

  return (
    <ResourcesAllListTable
      {...tableProps}
      {...props}
      formId={PROJECT_RESOURCES_ALL_FILTER_FORM_ID}
      hasProjectColumn
      hasCustomerColumn
      standalone={props.standalone ?? true}
    />
  );
};

export const AllResourcesList: FC<AllResourcesListProps> = (props) => {
  const initialValues = useMemo(() => getInitialValues(), []);
  return (
    <Form
      onSubmit={() => {}}
      subscription={{ values: true }}
      initialValues={initialValues}
    >
      {() => <AllResourcesListTable {...props} />}
    </Form>
  );
};
