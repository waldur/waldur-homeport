import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

import DashboardChart from './DashboardChart';
import { ChartsState } from './types';

interface Props extends ChartsState {
  onStart: () => void;
  onStop: () => void;
}

class DashboardChartList extends React.PureComponent<Props> {
  componentDidMount() {
    this.props.onStart();
  }

  componentWillUnmount() {
    this.props.onStop();
  }

  render() {
    const { loading, charts } = this.props;
    if (loading) {
      return <LoadingSpinner/>;
    }
    return (
      <div className="row">
        {charts.map((chart, index) => (
          <div key={index} className="col-lg-3 col-md-6">
            <DashboardChart chart={chart}/>
          </div>
        ))}
      </div>
    );
  }
}

export default DashboardChartList;
