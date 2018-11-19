import * as React from 'react';

import FlowMap from './FlowMap';
import { FlowMapFilter } from './FlowMapFilter';
import { MapInfoPanel } from './MapInfoPanel';

export interface FlowMapViewProps {
  serviceUsage: any;
  selectedServiceProvider: any;
  infoPanelIsVisible: boolean;
  serviceProviderSelect(uuid: string): void;
  showInfoPanel: () => void;
  hideInfoPanel: () => void;
}

export const FlowMapView = (props: FlowMapViewProps) => (
  <>
    <FlowMapFilter />
    <FlowMap
      center={[0, 0]}
      zoom={5}
      data={props.serviceUsage}
      selectServiceProvider={props.serviceProviderSelect}
      showInfoPanel={props.showInfoPanel}
    />
    {props.infoPanelIsVisible &&
      <MapInfoPanel
        onPanelClose={() => props.hideInfoPanel()}
        data={props.selectedServiceProvider}
      />
    }
  </>
);
