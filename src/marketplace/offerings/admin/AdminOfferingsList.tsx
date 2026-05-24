import { useEffect, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import { MarketplaceProviderOfferingsListData } from 'waldur-js-client';

import { getInitialValues, syncFiltersToURL } from '@/core/filters';
import { translate } from '@/i18n';

import { OFFERINGS_FILTER_FORM_ID } from '../constants';
import { BaseOfferingsList } from '../list/OfferingsList';
import { OfferingsListFilter } from '../list/OfferingsListFilter';
import { getStates } from '../list/OfferingStateFilter';

import { ADMIN_OFFERING_TABLE_NAME } from './constants';

export const buildOfferingsFilter = (filterValues: any) => {
  const filter: MarketplaceProviderOfferingsListData['query'] = {};
  if (filterValues?.organization) {
    filter.customer_uuid = filterValues.organization.customer_uuid;
  }
  if (filterValues) {
    if (filterValues.state && Array.isArray(filterValues.state)) {
      filter.state = filterValues.state.map((option) => option.value);
    }
    if (filterValues.offering_type) {
      filter.type = filterValues.offering_type.value;
    }
    if (filterValues.category) {
      filter.category_uuid = filterValues.category.uuid;
    }
    if (filterValues.tag) {
      filter.tag = filterValues.tag.uuid;
    }
    if (filterValues.shared !== undefined && filterValues.shared !== null) {
      filter.shared =
        typeof filterValues.shared === 'object'
          ? filterValues.shared.value
          : filterValues.shared;
    }
  }
  return filter;
};

export const mapStateToFilter = () => ({});

const AdminOfferingsListTable = () => {
  const { values } = useFormState();
  const filterValues: any = values;

  useEffect(() => {
    if (filterValues) {
      syncFiltersToURL(filterValues);
    }
  }, [filterValues]);

  const filter = useMemo(
    () => buildOfferingsFilter(filterValues),
    [filterValues],
  );

  return (
    <BaseOfferingsList
      table={ADMIN_OFFERING_TABLE_NAME}
      filter={filter}
      formId={OFFERINGS_FILTER_FORM_ID}
      hasOrganizationColumn
      showActions
      showProvider
      filters={<OfferingsListFilter />}
    />
  );
};

export const AdminOfferingsList = () => {
  const initialValues = useMemo(
    () =>
      getInitialValues({
        state: [getStates()[1], getStates()[2]],
        shared: { label: translate('Yes'), value: true },
      }),
    [],
  );
  return (
    <Form
      onSubmit={() => {}}
      subscription={{ values: true }}
      initialValues={initialValues}
    >
      {() => <AdminOfferingsListTable />}
    </Form>
  );
};
