import * as React from 'react';

import UsageMap from '@waldur/appstore/providers/support/UsageMap';

import { MapInfoPanel } from './MapInfoPanel';

import './providers-support.scss';

interface UsageMapViewProps {
  serviceUsage: any;
  selectedServiceProvider: any;
  serviceProviderSelect: (uuid: string) => void;
}

export const UsageMapView = (props: UsageMapViewProps) => (
  <>
    <UsageMap
      center={[0, 0]}
      zoom={5}
      id="usage-map"
      data={props.serviceUsage}
      serviceProviderSelect={props.serviceProviderSelect}
    />
    {props.selectedServiceProvider.uuid &&
      <div id="usage-map-panel">
        <MapInfoPanel data={props.selectedServiceProvider}/>
      </div>
    }
  </>
);

export default UsageMapView;
