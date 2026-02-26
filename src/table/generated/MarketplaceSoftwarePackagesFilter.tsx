// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  CatalogTypeEnum,
  MarketplaceSoftwarePackagesListData,
} from 'waldur-js-client';

import { StringField } from '@waldur/form';
import { Select, REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const CatalogTypeOptions: CatalogTypeOption[] = [
  {
    label: translate('Binary runtime'),
    value: 'binary_runtime',
  },
  {
    label: translate('Package manager'),
    value: 'package_manager',
  },
  {
    label: translate('Source package'),
    value: 'source_package',
  },
];
export interface CatalogTypeOption {
  label: string;
  value: CatalogTypeEnum;
}

const PureMarketplaceSoftwarePackagesFilter: FunctionComponent<{}> = () => (
  <>
    <TableFilterItem title={translate('Catalog')} name="catalog_name">
      <Field
        name="catalog_name"
        component={StringField}
        placeholder={translate('Catalog')}
      />
    </TableFilterItem>
    <TableFilterItem title={translate('Version')} name="catalog_version">
      <Field
        name="catalog_version"
        component={StringField}
        placeholder={translate('Version')}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Type')}
      name="catalog_type"
      getValueLabel={(value: CatalogTypeOption) => value?.label}
    >
      <Field
        name="catalog_type"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Type')}
            options={CatalogTypeOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: CatalogTypeOption) => String(option.value)}
            getOptionLabel={(option: CatalogTypeOption) => option.label}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem title={translate('Category')} name="category">
      <Field
        name="category"
        component={StringField}
        placeholder={translate('Category')}
      />
    </TableFilterItem>
    <TableFilterItem title={translate('License')} name="license">
      <Field
        name="license"
        component={StringField}
        placeholder={translate('License')}
      />
    </TableFilterItem>
    <TableFilterItem title={translate('Toolchain')} name="toolchain_name">
      <Field
        name="toolchain_name"
        component={StringField}
        placeholder={translate('Toolchain')}
      />
    </TableFilterItem>
  </>
);

export const MarketplaceSoftwarePackagesFilterFormId =
  'MarketplaceSoftwarePackagesFilter';

interface MarketplaceSoftwarePackagesFilterFormData {
  catalog_name: string;
  catalog_version: string;
  catalog_type: CatalogTypeOption;
  category: string;
  license: string;
  toolchain_name: string;
}

export const MarketplaceSoftwarePackagesFilter = reduxForm<
  MarketplaceSoftwarePackagesFilterFormData,
  {}
>({
  form: MarketplaceSoftwarePackagesFilterFormId,
  destroyOnUnmount: false,
})(PureMarketplaceSoftwarePackagesFilter);

type MarketplaceSoftwarePackagesFilterQuery =
  MarketplaceSoftwarePackagesListData['query'];

export const selectMarketplaceSoftwarePackagesFilter = createSelector<
  RootState,
  Partial<MarketplaceSoftwarePackagesFilterFormData>,
  MarketplaceSoftwarePackagesFilterQuery
>(getFormValues(MarketplaceSoftwarePackagesFilterFormId), (values) => {
  const filter: MarketplaceSoftwarePackagesFilterQuery = {} as any;
  if (values) {
    if (values.catalog_name) {
      filter.catalog_name = values.catalog_name;
    }
    if (values.catalog_version) {
      filter.catalog_version = values.catalog_version;
    }
    if (values.catalog_type) {
      filter.catalog_type = values.catalog_type.value;
    }
    if (values.category) {
      filter.category = values.category;
    }
    if (values.license) {
      filter.license = values.license;
    }
    if (values.toolchain_name) {
      filter.toolchain_name = values.toolchain_name;
    }
  }
  return filter;
});
