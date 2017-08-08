// @flow
import React, { PureComponent } from 'react';
import classNames from 'classnames';

import { SparklineChart } from './sparkline';
import type { Chart } from './types';
import { Panel } from './Panel';

export const ChangeIndicator = ({ change }: {change: number}) => {
  const textClass = classNames('font-bold m-b-sm', {
    'text-info': change > 0,
    'text-warning': change < 0,
    'text-muted': !change,
  });

  const iconClass = classNames('fa', {
    'fa-level-up': change > 0,
    'fa-level-down': change < 0,
    'fa-bolt': !change,
  });

  return (
    <div className={textClass}>
      <span className='pull-right'>
        {change || 0}%
        <i className={iconClass}></i>
      </span>
    </div>
  );
};

class DashboardChart extends PureComponent {
  props: {
    chart: Chart
  };

  render() {
    const { title, current, change, data } = this.props.chart;
    return (
      <Panel title={title}>
        <h1>{current}</h1>
        <SparklineChart data={data}/>
        <ChangeIndicator change={change}/>
      </Panel>
    );
  }
}

export default DashboardChart;
