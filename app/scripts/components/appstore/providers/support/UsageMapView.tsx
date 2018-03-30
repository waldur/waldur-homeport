import * as React from 'react';

import { MapInfoPanel } from '@waldur/appstore/providers/support/MapInfoPanel';
import UsageMap from '@waldur/appstore/providers/support/UsageMap';

import './providers-support.scss';
import { UsageMapFilter } from './UsageMapFilter';

export interface UsageMapViewProps {
  serviceUsage: any;
  selectedServiceProvider: any;
  selectServiceProvider: () => void;
  filter: boolean;
  showFilter: () => void;
  hideFilter: () => void;
}

export class UsageMapView extends React.Component<UsageMapViewProps, any> {
  serviceUsage: any;

  handleFilterClick = () => {
    this.props.showFilter();
  }

  renderInfoPanelContent = () => {
    if (this.props.selectedServiceProvider && !this.props.filter) {
      this.props.hideFilter();
      return <MapInfoPanel data={this.props.selectedServiceProvider} />;
    }
    return <UsageMapFilter />;
  }

  render() {
    const {
      serviceUsage,
      selectServiceProvider,
      hideFilter,
      filter,
    } = this.props;
    return (
      <>
        <UsageMap
          center={[0, 0]}
          zoom={5}
          id="usage-map"
          data={serviceUsage}
          selectServiceProvider={selectServiceProvider}
          hideFilter={hideFilter}
        />
        <div id="usage-map-panel">
          {!filter &&
            <button
              type="button"
              className="btn btn-outline btn-primary m-xxs"
              onClick={this.handleFilterClick}>Filter
            </button>
          }
          {this.renderInfoPanelContent()}
        </div>
      </>
    );
  }
}

export default UsageMapView;
