import * as React from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { setTitle } from '@waldur/navigation/title';

import { fetchServiceUsageStart } from './actions';
import { FlowMapFilter } from './FlowMapFilter';
import { HeatMap } from './HeatMap';
import { selectServiceUsage, selectCountriesToRender } from './selectors';

interface HeatMapComponentProps {
  fetchServiceUsageStart: () => void;
  serviceUsage: any;
  countriesToRender: any[];
  setTitle: typeof setTitle;
}

class HeatMapComponent extends React.Component<HeatMapComponentProps> {
  componentDidMount() {
    this.props.fetchServiceUsageStart();
    this.props.setTitle(translate('Heatmap'));
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

const mapStateToProps = (state) => ({
  serviceUsage: selectServiceUsage(state),
  countriesToRender: selectCountriesToRender(state),
});

const mapDispatchToProps = {
  fetchServiceUsageStart,
  setTitle,
};

export const HeatMapContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(HeatMapComponent);
