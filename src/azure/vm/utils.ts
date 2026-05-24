import {
  AzureImage,
  azureImagesList,
  azureLocationsList,
  AzureSize,
  azureSizesList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select';
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

export const loadLocationOptions = (settings_uuid: string) =>
  createLoadOptions(azureLocationsList, 'name', {
    settings_uuid,
    has_sizes: true,
  });

export const loadSizeOptions = (
  settings_uuid: string,
  location_uuid: string,
  zone: any,
) =>
  createLoadOptions(azureSizesList, 'name', {
    settings_uuid,
    location_uuid,
    zone,
  });

export const loadImageOptions = (
  settings_uuid: string,
  location_uuid: string,
) =>
  createLoadOptions(azureImagesList, 'name', {
    settings_uuid,
    location_uuid,
  });
