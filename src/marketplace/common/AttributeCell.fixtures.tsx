import { Attribute } from '@waldur/marketplace/types';

export const ListAttribute: Attribute = {
  key: 'node_information_cpu',
  title: 'CPU model',
  type: 'list',
  options: [
    {
      key: 'E5-2650v3',
      title: 'Intel Xeon E5-2650v3',
    },
    {
      key: 'Gold_6132',
      title: 'Intel Xeon Gold 6132',
    },
    {
      key: 'E7-8860v4',
      title: 'Intel Xeon E7-8860v4',
    },
    {
      key: 'E5-2680v3',
      title: 'Intel Xeon E5-2680v3',
    },
  ],
};

export const BooleanAttribute: Attribute = {
  key: 'iske_certified',
  title: 'ISKE certified',
  type: 'boolean',
};

export const ChoiceAttribute: Attribute = {
  key: 'node_information_gpu',
  title: 'GPU model',
  type: 'choice',
  options: [
    {
      key: 'gpu_NVidia_K80',
      title: 'NVidia K80',
    },
    {
      key: 'gpu_NVidia_P100',
      title: 'NVidia V100',
    },
    {
      key: 'gpu_NVidia_V100',
      title: 'NVidia V100',
    },
  ],
};

export const StringAttribute: Attribute = {
  key: 'home_path',
  title: 'ISKE certified',
  type: 'string',
};
