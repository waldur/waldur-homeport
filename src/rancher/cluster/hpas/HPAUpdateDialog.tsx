import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import { RancherHpa, rancherHpasUpdate } from 'waldur-js-client';

import { StringField, SelectField, NumberField, TextField } from '@/form';
import { translate } from '@/i18n';
import { ActionDialogFinal } from '@/modal/ActionDialogFinal';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { RANCHER_HPAS_TABLE_ID } from './constants';
import { MetricOption, HPAUpdateFormData } from './types';
import {
  getMetricNameOptions,
  getTargetTypeOptions,
  serializeMetrics,
} from './utils';

interface HPAUpdateDialogProps {
  resolve: {
    hpa: RancherHpa;
  };
}

const useHPAUpdateDialog = (originalHPA: RancherHpa) => {
  const { mutate, isPending } = useManagedMutation<any, any, HPAUpdateFormData>(
    {
      mutationFn: (formData) =>
        rancherHpasUpdate({
          path: { uuid: originalHPA.uuid },
          body: {
            name: formData.name,
            description: formData.description,
            min_replicas: formData.min_replicas,
            max_replicas: formData.max_replicas,
            metrics: serializeMetrics(formData),
          },
        }),
      successMessage: translate('Horizontal pod autoscaler has been updated.'),
      errorMessage: translate('Unable to update horizontal pod autoscaler.'),
      invalidateQueries: [{ queryKey: ['table', RANCHER_HPAS_TABLE_ID] }],
    },
  );

  return { mutate, isPending };
};

export const HPAUpdateDialog: FC<HPAUpdateDialogProps> = (props) => {
  const { hpa } = props.resolve;
  const { mutate, isPending } = useHPAUpdateDialog(hpa);

  const metricNameOptions = useMemo<MetricOption[]>(getMetricNameOptions, []);
  const targetTypeOptions = useMemo(getTargetTypeOptions, []);

  const initialValues = useMemo<Partial<HPAUpdateFormData>>(() => {
    const metric = hpa.metrics[0];
    return {
      name: hpa.name,
      description: hpa.description,
      min_replicas: hpa.min_replicas,
      max_replicas: hpa.max_replicas,
      metric_name: metricNameOptions.find(
        (option) => option.value === metric.name,
      ),
      target_type: targetTypeOptions.find(
        (option) =>
          option.value.toLocaleLowerCase() ===
          metric.target.type.toLocaleLowerCase(),
      ),
      quantity:
        metric.target.utilization ||
        (metric.target.averageValue
          ? parseFloat(metric.target.averageValue)
          : undefined),
    };
  }, [hpa, metricNameOptions, targetTypeOptions]);

  return (
    <Form<HPAUpdateFormData>
      onSubmit={mutate}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, values, invalid }) => {
        const metric = values.metric_name;

        return (
          <ActionDialogFinal
            title={translate('Update horizontal pod autoscaler')}
            submitLabel={translate('Submit')}
            onSubmit={handleSubmit}
            submitting={submitting || isPending}
            invalid={invalid}
          >
            <StringField
              name="name"
              label={translate('Name')}
              required={true}
            />
            <TextField
              name="description"
              label={translate('Description')}
              required={false}
            />

            <NumberField
              name="min_replicas"
              label={translate('Min replicas')}
              required={true}
              min={1}
              max={10}
            />

            <NumberField
              name="max_replicas"
              label={translate('Max replicas')}
              required={true}
              min={1}
              max={10}
            />

            <SelectField
              name="metric_name"
              label={translate('Metric name')}
              required={true}
              options={metricNameOptions}
              isClearable={true}
            />

            <SelectField
              name="target_type"
              label={translate('Target type')}
              required={true}
              options={targetTypeOptions}
              isClearable={true}
            />

            <NumberField
              name="quantity"
              label={translate('Quantity')}
              required={true}
              unit={metric ? metric.unitDisplay : undefined}
            />
          </ActionDialogFinal>
        );
      }}
    />
  );
};
