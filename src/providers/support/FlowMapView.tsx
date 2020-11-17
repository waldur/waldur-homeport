import * as React from 'react';

import { FlowMap } from './FlowMap';
import { FlowMapFilter } from './FlowMapFilter';
import { MapInfoPanel } from './MapInfoPanel';
import { UsageData } from './types';

export interface FlowMapViewProps {
  serviceUsage: UsageData;
  selectedServiceProvider: any;
  infoPanelIsVisible: boolean;
  serviceProviderSelect(uuid: string): void;
  showInfoPanel: () => void;
  hideInfoPanel: () => void;
}

export const FlowMapView: React.FC<FlowMapViewProps> = (props) => (
  <>
    <FlowMapFilter />
    <FlowMap
      center={[58.5975, 24.9873]}
      zoom={5}
      data={props.serviceUsage}
      selectServiceProvider={props.serviceProviderSelect}
      showInfoPanel={props.showInfoPanel}
    />
    {props.infoPanelIsVisible && (
      <MapInfoPanel
        onPanelClose={() => props.hideInfoPanel()}
        data={props.selectedServiceProvider}
      />
    )}
  </>
);
