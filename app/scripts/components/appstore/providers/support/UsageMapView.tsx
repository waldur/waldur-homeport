import * as React from 'react';

import { MapInfoPanel } from '@waldur/appstore/providers/support/MapInfoPanel';
import UsageMap from '@waldur/appstore/providers/support/UsageMap';

import './providers-support.scss';

export interface UsageMapViewProps {
  serviceUsage: any;
  selectedServiceProvider: any;
  infoPanelIsVisible: boolean;
  selectServiceProvider: () => void;
  showInfoPanel: () => void;
  hideInfoPanel: () => void;
}

export class UsageMapView extends React.Component<UsageMapViewProps, any> {
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
    } = this.props;
    return (
      <>
        <UsageMap
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
            />
          </div>
        }
      </>
    );
  }
}

export default UsageMapView;
