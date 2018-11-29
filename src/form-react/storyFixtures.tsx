import * as React from 'react';

import { PriceTooltip } from '@waldur/price/PriceTooltip';

export const choices = [
  {
    url: 'http://localhost:8000/api/openstacktenant-images/8983fca5a420462d8adefd72a1ffbbc5/',
    uuid: '8983fca5a420462d8adefd72a1ffbbc5',
    name: '03.09_qcow2_kris',
    settings: 'http://localhost:8000/api/service-settings/3ffa92fa9272425282361c1451c8734d/',
    min_disk: 0,
    min_ram: 0,
    category: 'trial',
  },
  {
    url: 'http://localhost:8000/api/openstacktenant-images/e53ac3e70ac54f84be7b472127e5ebeb/',
    uuid: 'e53ac3e70ac54f84be7b472127e5ebeb',
    name: 'CentOS 7 64bit',
    settings: 'http://localhost:8000/api/service-settings/3ffa92fa9272425282361c1451c8734d/',
    min_disk: 0,
    min_ram: 0,
    category: 'trial',
  },
  {
    url: 'http://localhost:8000/api/openstacktenant-images/b5e14139fbb14e3299752690ed642caf/',
    uuid: 'b5e14139fbb14e3299752690ed642caf',
    name: 'chrome-image',
    settings: 'http://localhost:8000/api/service-settings/3ffa92fa9272425282361c1451c8734d/',
    min_disk: 10240,
    min_ram: 0,
    category: 'trial',
  },
  {
    url: 'http://localhost:8000/api/openstacktenant-images/6ee87b1b3d144e0eb2a8121dc4249449/',
    uuid: '6ee87b1b3d144e0eb2a8121dc4249449',
    name: 'Debian 9 64bit',
    settings: 'http://localhost:8000/api/service-settings/3ffa92fa9272425282361c1451c8734d/',
    min_disk: 0,
    min_ram: 0,
    category: 'medium',
  },
  {
    url: 'http://localhost:8000/api/openstacktenant-images/879e976b35ef405da1828dbd1d2e9b95/',
    uuid: '879e976b35ef405da1828dbd1d2e9b95',
    name: 'Ubuntu 16.04 64bit',
    settings: 'http://localhost:8000/api/service-settings/3ffa92fa9272425282361c1451c8734d/',
    min_disk: 0,
    min_ram: 0,
    category: 'medium',
  },
  {
    url: 'http://localhost:8000/api/openstacktenant-images/c93ab08fd3df4b5882174a2da7065c40/',
    uuid: 'c93ab08fd3df4b5882174a2da7065c40',
    name: 'virt-image',
    settings: 'http://localhost:8000/api/service-settings/3ffa92fa9272425282361c1451c8734d/',
    min_disk: 0,
    min_ram: 0,
    category: 'small',
  },
  {
    url: 'http://localhost:8000/api/openstacktenant-images/75c6bd5ce9cc464eb4a742c81a936b2a/',
    uuid: '75c6bd5ce9cc464eb4a742c81a936b2a',
    name: 'virt-test.qcow',
    settings: 'http://localhost:8000/api/service-settings/3ffa92fa9272425282361c1451c8734d/',
    min_disk: 0,
    min_ram: 0,
    category: 'large',
  },
];

export const columns = [
  {
    label: 'Image name',
    name: 'name',
  },
  {
    label: (
      <>
        Min RAM
        {' '}
        <PriceTooltip />
      </>
    ),
    name: 'min_ram',
  },
  {
    label: 'Min storage',
    name: 'min_disk',
  },
];

const TEMPLATE_CATEGORIES = ['Trial', 'Small', 'Medium', 'Large'];

export const openstackTemplateFilters = {
  name: 'category',
  choices: [
    {
      value: '',
      label: 'All categories',
    },
    ...TEMPLATE_CATEGORIES.map(category => ({
      value: category.toLowerCase(),
      label: category,
    })),
  ],
  defaultValue: '',
};
