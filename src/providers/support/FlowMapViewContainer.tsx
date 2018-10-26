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
  serviceProviderSelect: () => void;
  showInfoPanel: () => void;
  hideInfoPanel: () => void;
}

class FlowMapViewComponent extends React.Component<FlowMapViewComponentProps> {
  componentDidMount() {
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

const mapDispatchToProps = {
  fetchServiceUsageStart,
  serviceProviderSelect,
  showInfoPanel,
  hideInfoPanel,
};

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTranslation,
);

const FlowMapViewContainer = enhance(FlowMapViewComponent);

export default connectAngularComponent(FlowMapViewContainer);
