// @flow
import React, { PureComponent } from 'react';

import { LoadingSpinner } from '../../core/LoadingSpinner';
import type { Chart, Scope } from './types';
import DashboardChart from './DashboardChart';

class DashboardChartList extends PureComponent {
  props: {
    loading: boolean,
    charts: Array<Chart>,
    onStart: Function,
    onStop: Function,
  };

  componentWillMount() {
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
      <div className='row'>
        {charts.map((chart, index) =>
          <div key={index} className='col-lg-3 col-md-6'>
            <DashboardChart chart={chart}/>
          </div>
        )}
      </div>
    );
  }
}

export default DashboardChartList;
