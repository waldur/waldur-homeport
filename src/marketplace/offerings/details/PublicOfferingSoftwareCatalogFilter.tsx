import React from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  CatalogTypeEnum,
  MarketplaceSoftwarePackagesListData,
} from 'waldur-js-client';

import { StringField } from '@waldur/form';
import { REACT_SELECT_TABLE_FILTER, Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const SOFTWARE_CATALOG_FILTER_FORM_ID = 'publicOfferingSoftwareCatalogFilter';

const getCatalogTypeOptions = (): {
  value: CatalogTypeEnum;
  label: string;
}[] => [
  { value: 'binary_runtime', label: translate('Binary runtime') },
  { value: 'source_package', label: translate('Source package') },
  { value: 'package_manager', label: translate('Package manager') },
];

const PurePublicOfferingSoftwareCatalogFilter = () => (
  <>
    <TableFilterItem title={translate('Catalog')} name="catalog_name">
      <Field name="catalog_name" component={StringField} />
    </TableFilterItem>
    <TableFilterItem title={translate('Version')} name="catalog_version">
      <Field name="catalog_version" component={StringField} />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Type')}
      name="catalog_type"
      badgeValue={(value) => value?.label}
    >
      <Field
        name="catalog_type"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Select type...')}
            options={getCatalogTypeOptions()}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem title={translate('Category')} name="category">
      <Field name="category" component={StringField} />
    </TableFilterItem>
    <TableFilterItem title={translate('License')} name="license">
      <Field name="license" component={StringField} />
    </TableFilterItem>
    <TableFilterItem title={translate('Toolchain')} name="toolchain_name">
      <Field name="toolchain_name" component={StringField} />
    </TableFilterItem>
  </>
);

export const PublicOfferingSoftwareCatalogFilter = reduxForm({
  form: SOFTWARE_CATALOG_FILTER_FORM_ID,
  destroyOnUnmount: false,
})(PurePublicOfferingSoftwareCatalogFilter) as React.ComponentType;

export const selectSoftwareCatalogFilter = createSelector(
  getFormValues(SOFTWARE_CATALOG_FILTER_FORM_ID),
  (filterValues: any) => {
    const filter: MarketplaceSoftwarePackagesListData['query'] = {};
    if (filterValues) {
      if (filterValues.catalog_name) {
        filter.catalog_name = filterValues.catalog_name;
      }
      if (filterValues.catalog_version) {
        filter.catalog_version = filterValues.catalog_version;
      }
      if (filterValues.catalog_type) {
        filter.catalog_type = filterValues.catalog_type.value;
      }
      if (filterValues.category) {
        filter.category = filterValues.category;
      }
      if (filterValues.license) {
        filter.license = filterValues.license;
      }
      if (filterValues.toolchain_name) {
        filter.toolchain_name = filterValues.toolchain_name;
      }
    }
    return filter;
  },
);
