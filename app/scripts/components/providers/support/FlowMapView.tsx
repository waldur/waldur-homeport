import * as React from 'react';

import { TranslateProps } from '@waldur/i18n';

import './flow-map.scss';

import FlowMap from './FlowMap';
import { FlowMapFilter } from './FlowMapFilter';
import { MapInfoPanel } from './MapInfoPanel';

export interface FlowMapViewProps extends TranslateProps {
  serviceUsage: any;
  selectedServiceProvider: any;
  infoPanelIsVisible: boolean;
  selectServiceProvider: () => void;
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
      selectServiceProvider,
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
          selectServiceProvider={selectServiceProvider}
          showInfoPanel={showInfoPanel}
        />
        {infoPanelIsVisible &&
          <div id="usage-map-panel">
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
