import * as React from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { setTitle } from '@waldur/navigation/title';

import {
  fetchServiceUsageStart,
  serviceProviderSelect,
  showInfoPanel,
  hideInfoPanel,
} from './actions';
import { FlowMapView } from './FlowMapView';
import {
  selectServiceProvider,
  selectServiceUsage,
  selectInfoPanelStatus,
  selectServiceProviderConsumers,
} from './selectors';
import { UsageData } from './types';

interface FlowMapViewComponentProps {
  serviceUsage: UsageData;
  selectedServiceProvider: any;
  infoPanelIsVisible: boolean;
  fetchServiceUsageStart: () => void;
  serviceProviderSelect(uuid: string): void;
  showInfoPanel: () => void;
  hideInfoPanel: () => void;
  setTitle: typeof setTitle;
}

class FlowMapViewComponent extends React.Component<FlowMapViewComponentProps> {
  componentDidMount() {
    this.props.fetchServiceUsageStart();
    this.props.setTitle(translate('Flowmap'));
  }
  render() {
    return <FlowMapView {...this.props} />;
  }
}

const mapStateToProps = (state) => ({
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
  setTitle,
};

const enhance = connect(mapStateToProps, mapDispatchToProps);

export const FlowMapViewContainer = enhance(FlowMapViewComponent);
