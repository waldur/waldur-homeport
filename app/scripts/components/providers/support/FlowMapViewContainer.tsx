import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation, TranslateProps } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

import {
  fetchServiceUsageStart,
  serviceProviderSelect,
  showInfoPanel,
  hideInfoPanel,
} from './actions';
import FlowMapView from './FlowMapView';
import {
  selectServiceProvider,
  selectServiceUsage,
  selectInfoPanelStatus,
  selectServiceProviderConsumers,
} from './selectors';

interface FlowMapViewComponentProps extends TranslateProps {
  serviceUsage: any;
  selectedServiceProvider: any;
  infoPanelIsVisible: boolean;
  fetchServiceUsageStart: () => void;
  selectServiceProvider: () => void;
  showInfoPanel: () => void;
  hideInfoPanel: () => void;
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
  serviceUsage: selectServiceUsage(state),
  selectedServiceProvider: {
    ...selectServiceProvider(state),
    consumers: selectServiceProviderConsumers(state),
  },
  infoPanelIsVisible: selectInfoPanelStatus(state),
});

const mapDispatchToProps = dispatch => ({
  fetchServiceUsageStart: () => dispatch(fetchServiceUsageStart()),
  selectServiceProvider: (uuid: string) => dispatch(serviceProviderSelect(uuid)),
  showInfoPanel: () => dispatch(showInfoPanel()),
  hideInfoPanel: () => dispatch(hideInfoPanel()),
});

const enhance = compose(
  withTranslation,
  connect(mapStateToProps, mapDispatchToProps),
);

const FlowMapViewContainer = enhance(FlowMapViewComponent);

export default connectAngularComponent(FlowMapViewContainer);
