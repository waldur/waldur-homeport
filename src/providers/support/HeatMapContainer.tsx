import * as React from 'react';
import { connect } from 'react-redux';

import { connectAngularComponent } from '@waldur/store/connect';

import { fetchServiceUsageStart } from './actions';
import { FlowMapFilter } from './FlowMapFilter';
import { HeatMap } from './HeatMap';
import { selectServiceUsage, selectCountriesToRender } from './selectors';

interface HeatMapComponentProps {
  fetchServiceUsageStart: () => void;
  serviceUsage: any;
  countriesToRender: any[];
}

class HeatMapComponent extends React.Component<HeatMapComponentProps> {
  componentDidMount() {
    this.props.fetchServiceUsageStart();
  }
  render() {
    const { serviceUsage, countriesToRender } = this.props;
    return (
      <>
        <FlowMapFilter />
        <HeatMap
          center={[0, 0]}
          zoom={3}
          serviceUsage={serviceUsage}
          countriesToRender={countriesToRender}
        />
      </>
    );
  }
}

const mapStateToProps = state => ({
  serviceUsage: selectServiceUsage(state),
  countriesToRender: selectCountriesToRender(state),
});

const mapDispatchToProps = dispatch => ({
  fetchServiceUsageStart: () => dispatch(fetchServiceUsageStart()),
});

const HeatMapContainer = connect(mapStateToProps, mapDispatchToProps)(HeatMapComponent);

export default connectAngularComponent(HeatMapContainer);
