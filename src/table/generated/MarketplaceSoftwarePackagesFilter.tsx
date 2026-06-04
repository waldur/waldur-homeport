// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  CatalogTypeEnum,
  MarketplaceSoftwarePackagesListData,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { SelectFilter, BooleanFilter, StringFilter } from '@/table';

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
    <StringFilter
      title={translate('Catalog')}
      name="catalog_name"
      placeholder={translate('Catalog')}
    />
    <StringFilter
      title={translate('Version')}
      name="catalog_version"
      placeholder={translate('Version')}
    />
    <SelectFilter
      title={translate('Type')}
      name="catalog_type"
      getValueLabel={(value: CatalogTypeOption) => value?.label}
      placeholder={translate('Type')}
      options={CatalogTypeOptions}
      getOptionValue={(option: CatalogTypeOption) => String(option.value)}
      getOptionLabel={(option: CatalogTypeOption) => option.label}
      isClearable={true}
    />
    <StringFilter
      title={translate('Category')}
      name="category"
      placeholder={translate('Category')}
    />
    <StringFilter
      title={translate('License')}
      name="license"
      placeholder={translate('License')}
    />
    <StringFilter
      title={translate('Toolchain')}
      name="toolchain_name"
      placeholder={translate('Toolchain')}
    />
    <BooleanFilter
      title={translate('Has GPU')}
      name="has_gpu"
      badgeValue={(value) => (value ? translate('Has GPU') : translate('All'))}
      ellipsis={false}
      parse={(v) => v || undefined}
    />
    <StringFilter
      title={translate('GPU architecture')}
      name="gpu_arch"
      placeholder={translate('GPU architecture')}
    />
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
