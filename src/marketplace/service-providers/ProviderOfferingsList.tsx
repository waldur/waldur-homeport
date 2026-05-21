import { FC, useEffect, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import { marketplaceServiceProvidersOfferingsList } from 'waldur-js-client';

import { getInitialValues, syncFiltersToURL } from '@/core/filters';
import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { getLabel, getOfferingTypes } from '@/marketplace/common/registry';
import { createFetcher } from '@/table/api';
import { SLUG_COLUMN } from '@/table/slug';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { CreateOfferingButton } from '../offerings/list/CreateOfferingButton';
import { OfferingActions } from '../offerings/list/OfferingActions';
import { OfferingDropdownActions } from '../offerings/list/OfferingDropdownActions';
import { getStates } from '../offerings/list/OfferingStateFilter';
import { OfferingStateField } from '../offerings/OfferingStateField';
import { CustomerResourcesListPlaceholder } from '../resources/list/CustomerResourcesListPlaceholder';
import { ServiceProvider } from '../types';

import { PROVIDER_OFFERINGS_FORM_ID } from './constants';
import { OfferingNameColumn } from './OfferingNameColumn';
import {
  getFiltersFromParams,
  ProviderOfferingsFilter,
} from './ProviderOfferingsFilter';
import { ResourcesCountColumn } from './ResourcesCountColumn';

interface ProviderOfferingsComponentProps {
  provider: ServiceProvider;
}

const mandatoryFields = [
  'uuid',
  'customer_uuid', // EditOfferingButton, DeleteOfferingButton
  'state', // PreviewOfferingButton, DeleteOfferingButton
  'components', // PreviewOfferingButton
  'type', // PreviewOfferingButton
  'resources_count', // DeleteOfferingButton
  'offering_group_uuid', // SetOfferingGroupAction (pre-populates current group)
  'offering_group_title', // SetOfferingGroupAction
];

const ProviderOfferingsComponent: FC<ProviderOfferingsComponentProps> = ({
  provider,
}) => {
  const { values } = useFormState();
  const filterValues: any = values;

  useEffect(() => {
    if (filterValues) {
      syncFiltersToURL(filterValues);
    }
  }, [filterValues]);

  const filter = useMemo(() => {
    const result: Record<string, any> = {};
    if (filterValues?.state) {
      result.state = filterValues.state.map((option) => option.value);
    }
    if (filterValues?.offering_type) {
      result.type = filterValues.offering_type.value;
    }
    if (filterValues?.tag) {
      result.tag = filterValues.tag.uuid;
    }
    return result;
  }, [filterValues]);

  const tableProps = useTable({
    table: 'ProviderOfferingsList',
    fetchData: createFetcher(marketplaceServiceProvidersOfferingsList, {
      path: { service_provider_uuid: provider.uuid },
    }),
    filter,
    queryField: 'name',
    mandatoryFields,
  });

  return (
    <Table
      {...tableProps}
      formId={PROVIDER_OFFERINGS_FORM_ID}
      columns={[
        {
          title: translate('Offering / Category'),
          render: OfferingNameColumn,
          id: 'name',
          keys: ['name', 'backend_id', 'uuid', 'category_title'],
        },
        {
          title: translate('Offering group'),
          render: ({ row }) => renderFieldOrDash(row.offering_group_title),
          id: 'offering_group',
          keys: ['offering_group_uuid', 'offering_group_title'],
        },
        {
          title: translate('Type'),
          render: ({ row }) => getLabel(row.type),
          filter: 'offering_type',
          inlineFilter: (row) =>
            getOfferingTypes().find((op) => op.value === row.type),
          id: 'type',
          keys: ['type'],
        },
        {
          title: translate('Resources'),
          render: ResourcesCountColumn,
          id: 'resources_count',
          keys: ['resources_count'],
        },
        {
          title: translate('Estimated cost'),
          render: ({ row }) =>
            defaultCurrency(row.billing_price_estimate?.total || 0),
          id: 'billing_price_estimate',
          keys: ['billing_price_estimate'],
        },
        {
          title: translate('State'),
          render: ({ row }) => <OfferingStateField offering={row} />,
          filter: 'state',
          inlineFilter: (row) =>
            getStates().filter((op) => op.value === row.state),
          id: 'state',
          keys: ['state'],
        },
        SLUG_COLUMN,
      ]}
      verboseName={translate('Offerings')}
      dropdownActions={<OfferingDropdownActions refetch={tableProps.fetch} />}
      tableActions={<CreateOfferingButton fetch={tableProps.fetch} />}
      rowActions={(row) => (
        <OfferingActions row={row.row} refetch={tableProps.fetch} />
      )}
      filters={<ProviderOfferingsFilter />}
      hasQuery={true}
      hasOptionalColumns
    />
  );
};

export const ProviderOfferingsList = ({ provider }) => {
  const initialValues = useMemo(
    () => getFiltersFromParams(getInitialValues()),
    [],
  );

  if (!provider) {
    return <CustomerResourcesListPlaceholder />;
  }
  return (
    <Form
      onSubmit={() => {}}
      subscription={{ values: true }}
      initialValues={initialValues}
    >
      {() => <ProviderOfferingsComponent provider={provider} />}
    </Form>
  );
};
