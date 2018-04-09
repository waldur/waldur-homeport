import * as React from 'react';
import { connect } from 'react-redux';

import { connectAngularComponent } from '@waldur/store/connect';

import {
  fetchServiceUsageStart,
  serviceProviderSelect,
  showInfoPanel,
  hideInfoPanel,
} from './actions';
import FlowMapView from './FlowMapView';
import {
  selectedServiceProviderSelector,
  serviceUsageSelector,
  filterSelector
} from './selectors';

interface FlowMapViewComponentProps {
  fetchServiceUsageStart: () => void;
  serviceUsage: any;
  selectedServiceProvider: any;
  selectServiceProvider: () => void;
  showInfoPanel: () => void;
  hideInfoPanel: () => void;
  infoPanelIsVisible: boolean;
}

class FlowMapViewComponent extends React.Component<FlowMapViewComponentProps> {
  componentWillMount() {
    this.props.fetchServiceUsageStart();
  }
  render() {
    return (
      <FlowMapView {...this.props} />
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

const FlowMapViewContainer = connect(mapStateToProps, mapDispatchToProps)(FlowMapViewComponent);

export default connectAngularComponent(FlowMapViewContainer);
