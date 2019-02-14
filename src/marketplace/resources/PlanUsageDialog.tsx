import * as React from 'react';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

import { PlanUsageRowProps } from './types';

const getChartData = (props: PlanUsageRowProps) => ({
  toolbox: {
    show: true,
    showTitle: false,
    feature: {
      saveAsImage: {},
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
          name: translate('Remaining limit'),
          value: Math.max(0, props.row.limit - props.row.usage),
        },
      ],
    },
  ],
});

export const PlanUsageDialog = (props: {resolve: PlanUsageRowProps}) => (
  <ModalDialog
    title={translate('Plan capacity ({provider} / {offering})', {
      provider: props.resolve.row.customer_provider_name,
      offering: props.resolve.row.offering_name,
    })}
    footer={<CloseDialogButton/>}>
    <EChart options={getChartData(props.resolve)} height="300px" />
  </ModalDialog>
);

export default connectAngularComponent(PlanUsageDialog, ['resolve']);
