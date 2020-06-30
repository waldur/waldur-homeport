import * as React from 'react';
import useAsync from 'react-use/lib/useAsync';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

function loadChartjs() {
  return import(/* webpackChunkName: "chartjs" */ 'chart.js');
}

export const AllocationUsageChart = ({ chart }) => {
  const { loading, error, value: moduleValue } = useAsync(loadChartjs);

  const containerRef = React.useRef<any>();

  React.useEffect(() => {
    if (!moduleValue || !containerRef || !chart) {
      return;
    }
    const ctx = containerRef.current.getContext('2d');
    const options = {
      type: 'bar',
      data: chart,
      options: {
        responsive: true,
        tooltips: {
          mode: 'index',
          intersect: false,
        },
        legend: {
          display: false,
        },
        scales: {
          xAxes: [
            {
              stacked: true,
            },
          ],
          yAxes: [
            {
              stacked: true,
            },
          ],
        },
      },
    };
    new moduleValue.default.default(ctx, options);
  }, [moduleValue, containerRef, chart]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <>{translate('Unable to load module')}</>;
  }

  if (moduleValue) {
    return (
      <div style={{ width: '100%' }}>
        <canvas ref={containerRef} />
      </div>
    );
  }
};
