import * as React from 'react';
import { useDispatch } from 'react-redux';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import { reduxForm } from 'redux-form';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { StringField, SelectField, NumberField, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { ActionDialog } from '@waldur/modal/ActionDialog';
import { closeModalDialog } from '@waldur/modal/actions';
import { updateHPA } from '@waldur/rancher/api';
import { HPA } from '@waldur/rancher/types';
import { showError, showSuccess } from '@waldur/store/coreSaga';
import { updateEntity } from '@waldur/table/actions';

interface OwnProps {
  resolve: {
    hpa: HPA;
  };
}

const useHPAUpdateDialog = (originalHPA) => {
  const [submitting, setSubmitting] = React.useState(false);
  const dispatch = useDispatch();
  const callback = React.useCallback(
    async (formData) => {
      try {
        setSubmitting(true);
        const response = await updateHPA(originalHPA.uuid, {
          name: formData.name,
          description: formData.description,
          min_replicas: formData.min_replicas,
          max_replicas: formData.max_replicas,
          metrics: [
            {
              name: formData.metric_name.value,
              type: 'Resource',
              target: {
                type: formData.target_type.value,
                utilization:
                  formData.target_type.value === 'Utilization'
                    ? formData.quantity
                    : null,
                value:
                  formData.target_type.value === 'Value'
                    ? formData.quantity
                    : null,
              },
            },
          ],
        });
        const hpa = response.data;
        dispatch(updateEntity('rancher-hpas', hpa.uuid, hpa));
      } catch (error) {
        const errorMessage = `${translate(
          'Unable to update horizontal pod autoscaler.',
        )} ${format(error)}`;
        dispatch(showError(errorMessage));
        setSubmitting(false);
        return;
      }
      dispatch(
        showSuccess(translate('Horizontal pod autoscaler has been updated.')),
      );
      dispatch(closeModalDialog());
    },
    [dispatch],
  );
  return {
    submitting,
    callback,
  };
};

export const HPAUpdateDialog = reduxForm<{}, OwnProps>({
  form: 'RancherHPAupdate',
})((props) => {
  const { hpa } = props.resolve;
  const { submitting, callback } = useHPAUpdateDialog(hpa);

  const metricNameOptions = React.useMemo(
    () => [
      { label: translate('CPU'), value: 'cpu' },
      { label: translate('Memory'), value: 'memory' },
    ],
    [],
  );

  const targetTypeOptions = React.useMemo(
    () => [
      { label: translate('Average value'), value: 'Value' },
      { label: translate('Average utilization'), value: 'Utilization' },
    ],
    [],
  );

  useEffectOnce(() => {
    const metric = hpa.metrics[0];
    props.initialize({
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
      quantity: metric.target.utilization || metric.target.value,
    });
  });

  return (
    <ActionDialog
      title={translate('update horizontal pod autoscaler')}
      submitLabel={translate('Submit')}
      onSubmit={props.handleSubmit(callback)}
      submitting={submitting}
    >
      <StringField name="name" label={translate('Name')} required={true} />
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
      />
      <SelectField
        name="target_type"
        label={translate('Target type')}
        required={true}
        options={targetTypeOptions}
      />
      <NumberField
        name="quantity"
        label={translate('Quantity')}
        required={true}
      />
    </ActionDialog>
  );
});
