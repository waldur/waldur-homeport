import * as React from 'react';

import Panel from '@waldur/core/Panel';

import ChangeIndicator from './ChangeIndicator';
import SparklineChart from './sparkline';
import { Chart } from './types';

interface Props {
  chart: Chart;
}

const DashboardChart = (props: Props) => {
  const { title, units, current, change, data } = props.chart;
  let titleUnits = title;
  if (units) {
    titleUnits += ', ' + units;
  }
  return (
    <Panel title={titleUnits}>
      <h1>{current}</h1>
      <SparklineChart data={data}/>
      <ChangeIndicator change={change}/>
    </Panel>
  );
};

export default DashboardChart;
