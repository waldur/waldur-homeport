import { EChartsOption } from 'echarts';
import { DateTime } from 'luxon';
import { PlanUsageResponse } from 'waldur-js-client';

import { EChart } from '@/core/EChart';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

const getChartData = (props: { row: PlanUsageResponse }): EChartsOption => ({
  toolbox: {
    show: true,
    showTitle: false,
    feature: {
      saveAsImage: {
        name: `${props.row.plan_name}-${DateTime.now().toISODate()}`,
      },
    },
  },
  series: [
    {
      type: 'pie',
      radius: ['50%', '70%'],
      label: {
        show: true,
        formatter: '{b}: {c}',
      },
      data: [
        {
          name: translate('Usage'),
          value: props.row.usage,
        },
        {
          name: translate('Remaining amount'),
          value: Math.max(0, props.row.limit - props.row.usage),
        },
      ],
    },
  ],
});

export const PlanUsageDialog = (props: {
  resolve: { row: PlanUsageResponse };
}) => (
  <ModalDialog
    title={translate('Plan capacity')}
    footer={<CloseDialogButton label={translate('Ok')} />}
  >
    <p>
      <strong>{translate('Provider')}</strong>:{' '}
      {props.resolve.row.customer_provider_name}
    </p>
    <p>
      <strong>{translate('Offering')}</strong>:{' '}
      {props.resolve.row.offering_name}
    </p>
    <p>
      <strong>{translate('Plan')}</strong>: {props.resolve.row.plan_name}
    </p>
    <EChart options={getChartData(props.resolve)} height="300px" />
  </ModalDialog>
);
