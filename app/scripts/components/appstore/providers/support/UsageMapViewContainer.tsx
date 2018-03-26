import * as React from 'react';
import { connect } from 'react-redux';

import { connectAngularComponent } from '@waldur/store/connect';

import { fetchServiceUsageStart, serviceProviderSelect } from './actions';
import { selectedServiceProviderSelector, serviceUsageSelector } from './selectors';
import UsageMapView from './UsageMapView';

class UsageMapViewComponent extends React.Component<any, any> {
  componentWillMount() {
    this.props.fetchServiceUsageStart();
  }

  render() {
    const {
      serviceUsage,
      selectServiceProvider,
      selectedServiceProvider,
    } = this.props;

    return (
      <UsageMapView
      serviceProviderSelect={selectServiceProvider}
      serviceUsage={serviceUsage}
      selectedServiceProvider={selectedServiceProvider}/>
    );
  }
}

const mapStateToProps = state => ({
  serviceUsage: serviceUsageSelector(state),
  selectedServiceProvider: selectedServiceProviderSelector(state),
});

const mapDispatchToProps = dispatch => ({
  fetchServiceUsageStart: () => dispatch(fetchServiceUsageStart()),
  selectServiceProvider: (uuid: string) => dispatch(serviceProviderSelect(uuid)),
});

const UsageMapViewContainer = connect(mapStateToProps, mapDispatchToProps)(UsageMapViewComponent);

export default connectAngularComponent(UsageMapViewContainer);
