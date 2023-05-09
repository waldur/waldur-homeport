import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';

interface CircleProgressStatusProps {
  progress?: number;
  status?: undefined | 'complete' | 'error';
  message?: string;
}

const getChartData = (progress = 0) => ({
  toolbox: { show: false },
  series: [
    {
      type: 'pie',
      silent: true,
      radius: ['50%', '70%'],
      label: {
        show: true,
        position: 'center',
        formatter: '{c}%',
      },
      startAngle: 90,
      data: [
        {
          name: translate('Progress'),
          value: progress,
          itemStyle: {
            color:
              progress >= 60
                ? '#00dc8b'
                : progress >= 30
                ? '#ffd100'
                : '#ff0062',
          },
        },
        {
          // make an record to fill the empty space
          value: 100 - progress,
          itemStyle: {
            // stop the chart from rendering this piece
            color: 'none',
            decal: { symbol: 'none' },
          },
          label: { show: false },
        },
      ],
    },
  ],
});

export const CircleProgressStatus = (props: CircleProgressStatusProps) => {
  return (
    <div className="d-flex align-items-center">
      {props.status === 'error' ? (
        <>
          <span className="text-danger text-nowrap fst-italic me-4">
            {props.message}
          </span>
          <i className="fa fa-exclamation-circle display-6 text-danger"></i>
        </>
      ) : props.status === 'complete' ? (
        <i className="fa fa-check-circle display-6 text-success"></i>
      ) : (
        <EChart
          options={getChartData(props.progress)}
          height="70px"
          width="70px"
        />
      )}
    </div>
  );
};
