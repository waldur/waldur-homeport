import * as React from 'react';
import { connect } from 'react-redux';

import { connectAngularComponent } from '@waldur/store/connect';

import {
  fetchServiceUsageStart,
  serviceProviderSelect,
  showInfoPanel,
  hideInfoPanel,
} from './actions';
import {
  selectedServiceProviderSelector,
  serviceUsageSelector,
  filterSelector
} from './selectors';
import UsageMapView from './UsageMapView';

interface UsageMapViewComponentProps {
  fetchServiceUsageStart: () => void;
  serviceUsage: any;
  selectedServiceProvider: any;
  selectServiceProvider: () => void;
  showInfoPanel: () => void;
  hideInfoPanel: () => void;
  infoPanelIsVisible: boolean;
}

class UsageMapViewComponent extends React.Component<UsageMapViewComponentProps> {
  componentWillMount() {
    this.props.fetchServiceUsageStart();
  }
  render() {
    return (
      <UsageMapView {...this.props} />
    );
  }
}

const mapStateToProps = state => ({
  serviceUsage: serviceUsageSelector(state),
  selectedServiceProvider: selectedServiceProviderSelector(state),
  infoPanelIsVisible: filterSelector(state),
});

const mapDispatchToProps = dispatch => ({
  fetchServiceUsageStart: () => dispatch(fetchServiceUsageStart()),
  selectServiceProvider: (uuid: string) => dispatch(serviceProviderSelect(uuid)),
  showInfoPanel: () => dispatch(showInfoPanel()),
  hideInfoPanel: () => dispatch(hideInfoPanel()),
});

const UsageMapViewContainer = connect(mapStateToProps, mapDispatchToProps)(UsageMapViewComponent);

export default connectAngularComponent(UsageMapViewContainer);
