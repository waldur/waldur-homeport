// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  CatalogTypeEnum,
  MarketplaceSoftwarePackagesListData,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { BooleanFilter, SelectFilter } from '@/table';

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

export const MarketplaceSoftwarePackagesFilter: FunctionComponent<
  MarketplaceSoftwarePackagesFilterProps
> = (props) => (
  <>
    <SelectFilter
      title={translate('Catalog')}
      name="catalog_name"
      getValueLabel={(value: any) => value?.label}
      options={props.catalogNameOptions}
      isClearable={true}
      facet="catalog_name"
      placeholder={translate('Catalog')}
    />
    <SelectFilter
      title={translate('Version')}
      name="catalog_version"
      getValueLabel={(value: any) => value?.label}
      options={props.catalogVersionOptions}
      isClearable={true}
      facet="catalog_version"
      placeholder={translate('Version')}
    />
    <SelectFilter
      title={translate('Type')}
      name="catalog_type"
      getValueLabel={(value: CatalogTypeOption) => value?.label}
      options={CatalogTypeOptions}
      getOptionValue={(option: CatalogTypeOption) => String(option.value)}
      getOptionLabel={(option: CatalogTypeOption) => option.label}
      isClearable={true}
      facet="catalog_type"
      placeholder={translate('Type')}
    />
    <SelectFilter
      title={translate('Category')}
      name="category"
      getValueLabel={(value: any) => value?.label}
      options={props.categoryOptions}
      isClearable={true}
      facet="category"
      placeholder={translate('Category')}
    />
    <SelectFilter
      title={translate('License')}
      name="license"
      getValueLabel={(value: any) => value?.label}
      options={props.licenseOptions}
      isClearable={true}
      facet="license"
      placeholder={translate('License')}
    />
    <SelectFilter
      title={translate('Toolchain')}
      name="toolchain_name"
      getValueLabel={(value: any) => value?.label}
      options={props.toolchainOptions}
      isClearable={true}
      facet="toolchain"
      placeholder={translate('Toolchain')}
    />
    <BooleanFilter
      title={translate('Has GPU')}
      name="has_gpu"
      badgeValue={(value) => (value ? translate('Has GPU') : translate('All'))}
      ellipsis={false}
      parse={(v) => v || undefined}
    />
    <SelectFilter
      title={translate('GPU architecture')}
      name="gpu_arch"
      getValueLabel={(value: any) => value?.label}
      options={props.gpuArchOptions}
      isClearable={true}
      facet="gpu_arch"
      placeholder={translate('GPU architecture')}
    />
  </>
);

export const MarketplaceSoftwarePackagesFilterFormId =
  'MarketplaceSoftwarePackagesFilter';

interface MarketplaceSoftwarePackagesFilterProps {
  catalogNameOptions?: any[];
  catalogVersionOptions?: any[];
  categoryOptions?: any[];
  gpuArchOptions?: any[];
  licenseOptions?: any[];
  toolchainOptions?: any[];
}

export interface MarketplaceSoftwarePackagesFilterFormData {
  catalog_name: any;
  catalog_version: any;
  catalog_type: CatalogTypeOption;
  category: any;
  license: any;
  toolchain_name: any;
  has_gpu: boolean;
  gpu_arch: any;
}

type MarketplaceSoftwarePackagesFilterQuery =
  MarketplaceSoftwarePackagesListData['query'];

export const selectMarketplaceSoftwarePackagesFilter = (
  values?: Partial<MarketplaceSoftwarePackagesFilterFormData>,
): MarketplaceSoftwarePackagesFilterQuery => {
  const filter: MarketplaceSoftwarePackagesFilterQuery = {} as any;
  if (values) {
    if (values.catalog_name) {
      filter.catalog_name_exact = values.catalog_name.value;
    }
    if (values.catalog_version) {
      filter.catalog_version_exact = values.catalog_version.value;
    }
    if (values.catalog_type) {
      filter.catalog_type = values.catalog_type.value;
    }
    if (values.category) {
      filter.category = values.category.value;
    }
    if (values.license) {
      filter.license = values.license.value;
    }
    if (values.toolchain_name) {
      filter.toolchain_name = values.toolchain_name.value;
    }
    if (values.has_gpu) {
      filter.has_gpu = values.has_gpu;
    }
    if (values.gpu_arch) {
      filter.gpu_arch = values.gpu_arch.value;
    }
  }
  return filter;
};
