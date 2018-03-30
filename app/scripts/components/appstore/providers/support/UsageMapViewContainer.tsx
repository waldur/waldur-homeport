import * as React from 'react';
import { connect } from 'react-redux';

import { connectAngularComponent } from '@waldur/store/connect';

import {
  fetchServiceUsageStart,
  serviceProviderSelect,
  showFilter,
  hideFilter,
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
  showFilter: () => void;
  hideFilter: () => void;
  filter: boolean;
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
  filter: filterSelector(state),
});

const mapDispatchToProps = dispatch => ({
  fetchServiceUsageStart: () => dispatch(fetchServiceUsageStart()),
  selectServiceProvider: (uuid: string) => dispatch(serviceProviderSelect(uuid)),
  showFilter: () => dispatch(showFilter()),
  hideFilter: () => dispatch(hideFilter()),
});

const UsageMapViewContainer = connect(mapStateToProps, mapDispatchToProps)(UsageMapViewComponent);

export default connectAngularComponent(UsageMapViewContainer);
