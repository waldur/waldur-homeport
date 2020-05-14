// This directive is based on code from https://hackernoon.com/a-simple-pie-chart-in-svg-dbdd653b6936
import * as React from 'react';

const getCoordinatesForPercent = percent => {
  const x = Math.cos(2 * Math.PI * percent);
  const y = Math.sin(2 * Math.PI * percent);
  return [x, y];
};

const getSlices = value => [
  {
    percent: value,
    color: 'Coral',
  },
  {
    percent: 1 - value,
    color: '#00ab6b',
  },
];

export const QuotaPie = ({ value }) => {
  const slices = getSlices(value);
  let cumulativePercent = 0;

  return (
    <svg viewBox="-1 -1 2.1 2.1" rotate="-90deg" height="15px">
      {slices.map((slice, index) => {
        // destructuring assignment sets the two variables at once
        const [startX, startY] = getCoordinatesForPercent(cumulativePercent);

        // each slice starts where the last slice ended, so keep a cumulative percent
        cumulativePercent += slice.percent;

        const [endX, endY] = getCoordinatesForPercent(cumulativePercent);

        // if the slice is more than 50%, take the large arc (the long way around)
        const largeArcFlag = slice.percent > 0.5 ? 1 : 0;

        // create an array and join it just for code readability
        const pathData = [
          `M ${startX} ${startY}`, // Move
          `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc
          `L 0 0`, // Line
        ].join(' ');

        return <path key={index} d={pathData} fill={slice.color} />;
      })}
    </svg>
  );
};
