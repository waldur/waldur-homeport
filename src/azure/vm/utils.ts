import { getLocations, getImages, getSizes } from '@waldur/azure/common/api';
import { Size, Option, Image } from '@waldur/azure/common/types';
import { formatFlavor } from '@waldur/resource/utils';

const formatSizeOption = (size: Size): Option => {
  const summary = formatFlavor({
    disk: size.os_disk_size_in_mb + size.resource_disk_size_in_mb,
    cores: size.number_of_cores,
    ram: size.memory_in_mb,
  });
  const name = size.name.replace(/_/g, ' ');
  return {
    url: size.url,
    name: `${name} (${summary})`,
  };
};

const formatImageOption = (image: Image): Option => {
  return {
    url: image.url,
    name: `${image.publisher} ${image.name} ${image.sku}`,
  };
};

// tslint:disable:variable-name
export const loadData = (settings_uuid: string) =>
  Promise.all([
    getLocations(settings_uuid),
    getImages(settings_uuid),
    getSizes(settings_uuid),
  ]).then(([
    locations,
    images,
    sizes,
  ]) => ({
    locations,
    images: images.map(formatImageOption),
    sizes: sizes.map(formatSizeOption),
  }));
