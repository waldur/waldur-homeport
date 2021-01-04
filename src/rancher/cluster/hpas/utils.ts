import { formValueSelector } from 'redux-form';

import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

import { MetricsFormData } from './types';

export const getMetricNameOptions = () => [
  {
    label: translate('CPU'),
    value: 'cpu',
    unit: 'm',
    unitDisplay: translate('milli CPUs'),
  },
  {
    label: translate('Memory'),
    value: 'memory',
    unit: 'Mi',
    unitDisplay: translate('MiB'),
  },
];

export const getTargetTypeOptions = () => [
  { label: translate('Average value'), value: 'AverageValue' },
  { label: translate('Average utilization'), value: 'Utilization' },
];

export const serializeMetrics = (formData: MetricsFormData) => [
  {
    name: formData.metric_name.value,
    type: 'Resource',
    target: {
      type: formData.target_type.value,
      utilization:
        formData.target_type.value === 'Utilization' ? formData.quantity : null,
      averageValue:
        formData.target_type.value === 'AverageValue'
          ? `${formData.quantity}${formData.metric_name.unit}`
          : null,
    },
  },
];

export const FORM_ID = 'RancherHPACreate';

export const metricSelector = (state: RootState) =>
  formValueSelector(FORM_ID)(state, 'metric_name');
