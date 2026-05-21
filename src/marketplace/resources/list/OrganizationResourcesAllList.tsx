import { FC, useEffect, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import { marketplaceResourcesList } from 'waldur-js-client';

import { getInitialValues, syncFiltersToURL } from '@/core/filters';
import { PROJECT_RESOURCES_ALL_FILTER_FORM_ID } from '@/marketplace/resources/list/constants';
import { createFetcher } from '@/table/api';
import { TableProps } from '@/table/types';
import { useTable } from '@/table/useTable';
import { useCustomer } from '@/workspace/hooks';

import { ResourcesAllListTable } from './ResourcesAllListTable';
import { buildResourcesAllFilter, resourcesListRequiredFields } from './utils';

const OrganizationResourcesAllListTable: FC<Partial<TableProps>> = (props) => {
  const customer = useCustomer();
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
        customer_uuid: customer?.uuid,
      }),
    [filterValues, customer],
  );

  const tableProps = useTable({
    table: `OrganizationResourcesAllList`,
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
      hasProjectColumn
      context="organization"
    />
  );
};

export const OrganizationResourcesAllList: FC<Partial<TableProps>> = (
  props,
) => {
  const initialValues = useMemo(() => getInitialValues(), []);
  return (
    <Form
      onSubmit={() => {}}
      subscription={{ values: true }}
      initialValues={initialValues}
    >
      {() => <OrganizationResourcesAllListTable {...props} />}
    </Form>
  );
};
