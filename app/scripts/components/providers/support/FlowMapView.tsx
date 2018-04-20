import * as React from 'react';

import { TranslateProps } from '@waldur/i18n';

import FlowMap from './FlowMap';
import { FlowMapFilter } from './FlowMapFilter';
import { MapInfoPanel } from './MapInfoPanel';

export interface FlowMapViewProps extends TranslateProps {
  serviceUsage: any;
  selectedServiceProvider: any;
  infoPanelIsVisible: boolean;
  serviceProviderSelect: () => void;
  showInfoPanel: () => void;
  hideInfoPanel: () => void;
}

export class FlowMapView extends React.Component<FlowMapViewProps, any> {
  serviceUsage: any;

  handleCloseClick = () => {
    this.props.hideInfoPanel();
  }

  render() {
    const {
      serviceUsage,
      serviceProviderSelect,
      infoPanelIsVisible,
      showInfoPanel,
      translate,
    } = this.props;
    return (
      <>
        <FlowMapFilter />
        <FlowMap
          center={[0, 0]}
          zoom={5}
          data={serviceUsage}
          selectServiceProvider={serviceProviderSelect}
          showInfoPanel={showInfoPanel}
        />
        {infoPanelIsVisible &&
          <div id="flow-map-panel">
            <MapInfoPanel
              onPanelClose={this.handleCloseClick}
              data={this.props.selectedServiceProvider}
              translate={translate}
            />
          </div>
        }
      </>
    );
  }
}

export default FlowMapView;
