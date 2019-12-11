import { Option } from 'react-select';

import { formatFlavor } from '@waldur/resource/utils';

import { VolumeType } from '../types';

export const validateAndSort = (formData, choices, validator, comparator) =>
  choices.map(choice => ({
    ...choice,
    disabled: validator(formData, choice),
  })).sort(comparator);

export const formatFlavorTitle = flavor => {
  const props = formatFlavor(flavor);
  return `${flavor.name} (${props})`;
};

export const calculateSystemVolumeSize = formData => {
  const minValue = getMinSystemVolumeSize(formData);
  const currentValue = formData.system_volume_size || 0;
  return Math.max(currentValue, minValue);
};

export const getMinSystemVolumeSize = formData => {
  const imageMinValue = formData.image ? formData.image.min_disk : 0;
  const flavorMinValue = formData.flavor ? formData.flavor.disk : 0;
  return Math.max(imageMinValue, flavorMinValue);
};

export const formatVolumeTypeChoices = (volumeTypes: VolumeType[]): Option[] =>
  volumeTypes.map(volumeType => ({
    label: volumeType.description ?
      `${volumeType.name} (${volumeType.description})` : volumeType.name,
    value: volumeType.url,
  }));
