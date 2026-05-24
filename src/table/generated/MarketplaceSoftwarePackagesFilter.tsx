// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import {
  CatalogTypeEnum,
  MarketplaceSoftwarePackagesListData,
} from 'waldur-js-client';

import { StringField } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

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

export const MarketplaceSoftwarePackagesFilter: FunctionComponent<{}> = () => (
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
            variant="tableFilter"
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
    <TableFilterItem
      title={translate('Has GPU')}
      name="has_gpu"
      badgeValue={(value) => (value ? translate('Has GPU') : translate('All'))}
      ellipsis={false}
    >
      <Field
        name="has_gpu"
        component={AwesomeCheckboxField}
        label={translate('Has GPU')}
        parse={(v) => v || undefined}
      />
    </TableFilterItem>
    <TableFilterItem title={translate('GPU architecture')} name="gpu_arch">
      <Field
        name="gpu_arch"
        component={StringField}
        placeholder={translate('GPU architecture')}
      />
    </TableFilterItem>
  </>
);

export const MarketplaceSoftwarePackagesFilterFormId =
  'MarketplaceSoftwarePackagesFilter';

export interface MarketplaceSoftwarePackagesFilterFormData {
  catalog_name: string;
  catalog_version: string;
  catalog_type: CatalogTypeOption;
  category: string;
  license: string;
  toolchain_name: string;
  has_gpu: boolean;
  gpu_arch: string;
}

type MarketplaceSoftwarePackagesFilterQuery =
  MarketplaceSoftwarePackagesListData['query'];

export const selectMarketplaceSoftwarePackagesFilter = (
  values?: Partial<MarketplaceSoftwarePackagesFilterFormData>,
): MarketplaceSoftwarePackagesFilterQuery => {
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
    if (values.has_gpu) {
      filter.has_gpu = values.has_gpu;
    }
    if (values.gpu_arch) {
      filter.gpu_arch = values.gpu_arch;
    }
  }
  return filter;
};
