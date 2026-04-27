import {
  AzureImage,
  azureImagesList,
  azureLocationsList,
  AzureSize,
  azureSizesList,
} from 'waldur-js-client';

import { parseSelectData } from '@/core/api';
import { ENV } from '@/core/config';
import { returnReactSelectAsyncPaginateObject } from '@/core/utils';
import { formatFlavor } from '@/resource/utils';

export const getSizeLabel = (size: AzureSize): string => {
  const summary = formatFlavor({
    disk: size.os_disk_size_in_mb + size.resource_disk_size_in_mb,
    cores: size.number_of_cores,
    ram: size.memory_in_mb,
  });
  const name = size.name.replace(/_/g, ' ');
  return `${name} (${summary})`;
};

export const getImageLabel = (image: AzureImage): string =>
  `${image.publisher} ${image.name} ${image.sku}`;

export const loadLocationOptions = async (
  settings_uuid: string,
  query: string,
  prevOptions,
  currentPage: number,
) => {
  const response = await azureLocationsList({
    query: {
      settings_uuid,
      name: query,
      page: currentPage,
      page_size: ENV.pageSize,
      has_sizes: true,
    },
  });
  return returnReactSelectAsyncPaginateObject(
    parseSelectData(response),
    prevOptions,
    currentPage,
  );
};

export const loadSizeOptions = async (
  settings_uuid: string,
  location_uuid: string,
  zone: number,
  query: string,
  prevOptions,
  currentPage: number,
) => {
  const response = await azureSizesList({
    query: {
      settings_uuid,
      location_uuid,
      zone,
      name: query,
      page: currentPage,
      page_size: ENV.pageSize,
    },
  });
  return returnReactSelectAsyncPaginateObject(
    parseSelectData(response),
    prevOptions,
    currentPage,
  );
};

export const loadImageOptions = async (
  settings_uuid: string,
  location_uuid: string,
  query: string,
  prevOptions,
  currentPage: number,
) => {
  const response = await azureImagesList({
    query: {
      settings_uuid,
      location_uuid,
      name: query,
      page: currentPage,
      page_size: ENV.pageSize,
    },
  });
  return returnReactSelectAsyncPaginateObject(
    parseSelectData(response),
    prevOptions,
    currentPage,
  );
};
