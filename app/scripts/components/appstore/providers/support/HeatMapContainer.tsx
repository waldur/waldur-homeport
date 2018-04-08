import * as React from 'react';
import { connect } from 'react-redux';

import { connectAngularComponent } from '@waldur/store/connect';

import { fetchServiceUsageStart } from './actions';
import HeatMap from './HeatMap';
import { serviceUsageSelector } from './selectors';

interface HeatMapComponentProps {
  fetchServiceUsageStart: () => void;
  serviceUsage: any;
}

class HeatMapComponent extends React.Component<HeatMapComponentProps> {
  componentWillMount() {
    this.props.fetchServiceUsageStart();
  }
  render() {
    const { serviceUsage } = this.props;
    return (
      <HeatMap
        center={[0, 0]}
        zoom={3}
        id="heat-map"
        data={serviceUsage}
      />
    );
  }
}

const mapStateToProps = state => ({
  serviceUsage: serviceUsageSelector(state),
});

const mapDispatchToProps = dispatch => ({
  fetchServiceUsageStart: () => dispatch(fetchServiceUsageStart()),
});

const HeatMapContainer = connect(mapStateToProps, mapDispatchToProps)(HeatMapComponent);

export default connectAngularComponent(HeatMapContainer);
