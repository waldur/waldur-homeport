import * as React from 'react';

import UsageMap from '@waldur/appstore/providers/support/UsageMap';
import { connectAngularComponent } from '@waldur/store/connect';

const data = [
  {
    uuid: '24j12l4h124j124',
    type: 'slurm',
    longitude: 34.5,
    latitude: 17,
    usageCount: 30,
  },
  {
    uuid: '56j12l4h124jgt7',
    type: 'openstack',
    longitude: 24.7536,
    latitude: 59.4370,
    usageCount: 30,
  },
  {
    uuid: '7mj12l4h124jgkl',
    type: 'amazon',
    longitude: 4.8952,
    latitude: 52.3702,
    usageCount: 50,
  },
  {
    uuid: '24j1hl4h124j124',
    type: 'slurm',
    longitude: 23.8813,
    latitude: 55.1694,
    usageCount: 60,
  },
  {
    uuid: '56j12l4hu24jgt7',
    type: 'openstack',
    longitude: 13.4050,
    latitude: 52.5200,
    usageCount: 40,
  },
  {
    uuid: '7mj12l4h120jgkl',
    type: 'amazon',
    longitude: 46.7218,
    latitude: 47.5639,
    usageCount: 50,
  },
];

const UsageMapView = () => (
  <div id="usage-map">
    <UsageMap
      center={[59.4370, 24.7536]}
      zoom={13}
      id="usage-map"
      data={data}
    />
  </div>
);

export default connectAngularComponent(UsageMapView);
