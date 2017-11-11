import React from 'react';
import { react2angular } from 'react2angular';
import { Tooltip } from './tooltip';
import { ChartData } from './types';
import './sparkline.scss';

type Props = {
  data: ChartData
};

const normalizeData = items => {
  const max = Math.max.apply(null, items.map(item => item.value || 1));
  return items.map(item => ({
    label: item.label,
    value: Math.round(item.value * 100 / max),
  }));
};

const SparklineChart = ({ data }: Props) => (
  <figure className='sparkline'>
    {normalizeData(data).map((item, index) =>
      <Tooltip key={index} label={item.label} id='sparkline'>
        <div className='sparkline-column'>
          <div className='sparkline-bar' style={{height: `${item.value}%`}}></div>
        </div>
      </Tooltip>
    )}
  </figure>
);

export default SparklineChart;
