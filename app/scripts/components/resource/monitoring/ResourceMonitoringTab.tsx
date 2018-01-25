import * as React from 'react';
import { connect } from 'react-redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { connectAngularComponent } from '@waldur/store/connect';

import { fetchMonitoring } from './actions';
import { getMonitoringState } from './selectors';

interface ResourceMonitoringTabProps {
  resource: any;
  onFetch: () => void;
  loading: boolean;
}

class PureResourceMonitoringTab extends React.Component<ResourceMonitoringTabProps> {
  render() {
    if (this.props.loading) {
      return <LoadingSpinner/>;
    }
  }

  componentWillMount() {
    this.props.onFetch();
  }
}

const mapStateToProps = (state, ownProps) =>
  getMonitoringState(ownProps.resource.url)(state);

const mapStateToDispatch = (dispatch, ownProps) => ({
  onFetch: dispatch(fetchMonitoring(ownProps.resource.url)),
});

const ResourceMonitoringTab = connect(mapStateToProps, mapStateToDispatch)(PureResourceMonitoringTab);

export default connectAngularComponent(ResourceMonitoringTab, ['resource']);
