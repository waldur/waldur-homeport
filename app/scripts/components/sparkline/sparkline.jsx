// @flow
import React from 'react';
import { react2angular } from 'react2angular';
import { Tooltip } from './tooltip';
import './sparkline.scss';

function normalizeData(items) {
  const max = Math.max.apply(null, items.map(item => item.value || 1));
  return items.map(item => ({
    label: item.label,
    value: Math.round(item.value * 100 / max),
  }));
}

type Props = {
  sparkData: Array<{
    label: string,
    value: number,
  }>
};

export const SparklineChart = ({ sparkData }: Props) => (
  <figure className='sparkline'>
    {normalizeData(sparkData).map((item, index) =>
      <Tooltip key={index} label={item.label}>
        <div className='sparkline-column'>
          <div className='sparkline-bar' style={{height: `${item.value}%`}}></div>
        </div>
      </Tooltip>
    )}
  </figure>
);

export default react2angular(SparklineChart, ['sparkData']);
