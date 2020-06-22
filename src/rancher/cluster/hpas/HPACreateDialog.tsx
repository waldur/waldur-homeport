import * as React from 'react';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { format } from '@waldur/core/ErrorMessageFormatter';
import {
  StringField,
  SelectField,
  SelectAsyncField,
  NumberField,
  TextField,
} from '@waldur/form';
import { translate } from '@waldur/i18n';
import { ActionDialog } from '@waldur/modal/ActionDialog';
import { closeModalDialog } from '@waldur/modal/actions';
import { createHPA, listWorkloads } from '@waldur/rancher/api';
import { Resource } from '@waldur/resource/types';
import { showError, showSuccess } from '@waldur/store/coreSaga';
import { createEntity } from '@waldur/table/actions';

interface OwnProps {
  resolve: {
    cluster: Resource;
  };
}

const useHPACreateDialog = (cluster) => {
  const [submitting, setSubmitting] = React.useState(false);
  const dispatch = useDispatch();
  const callback = React.useCallback(
    async (formData) => {
      try {
        setSubmitting(true);
        const response = await createHPA({
          name: formData.name,
          description: formData.description,
          workload: formData.workload.url,
          min_replicas: formData.min_replicas,
          max_replicas: formData.max_replicas,
          metrics: [
            {
              name: formData.metric_name.value,
              type: formData.metric_type.value,
              target: {
                type: formData.target_type.value,
                [formData.target_type.value]: formData.quantity,
              },
            },
          ],
        });
        const hpa = response.data;
        dispatch(createEntity('rancher-hpas', hpa.uuid, hpa));
      } catch (error) {
        const errorMessage = `${translate(
          'Unable to create horizontal pod autoscaler.',
        )} ${format(error)}`;
        dispatch(showError(errorMessage));
        setSubmitting(false);
        return;
      }
      dispatch(
        showSuccess(translate('Horizontal pod autoscaler has been created.')),
      );
      dispatch(closeModalDialog());
    },
    [dispatch, cluster],
  );
  return {
    submitting,
    createHPA: callback,
  };
};

export const HPACreateDialog = reduxForm<{}, OwnProps>({
  form: 'RancherHPACreate',
  initialValues: {
    min_replicas: 1,
    max_replicas: 10,
  },
})((props) => {
  const { submitting, createHPA } = useHPACreateDialog(props.resolve.cluster);
  const loadWorkloads = React.useCallback(
    () =>
      listWorkloads({
        params: { cluster_uuid: props.resolve.cluster.uuid },
      }).then((options) => ({ options })),
    [props.resolve.cluster.uuid],
  );

  const metricTypeOptions = React.useMemo(
    () => [
      { label: translate('Resource'), value: 'Resource' },
      { label: translate('Pods'), value: 'Pods' },
      { label: translate('Object'), value: 'Object' },
      { label: translate('External'), value: 'External' },
    ],
    [],
  );

  const metricNameOptions = React.useMemo(
    () => [
      { label: translate('CPU'), value: 'cpu' },
      { label: translate('Memory'), value: 'memory' },
    ],
    [],
  );

  const targetTypeOptions = React.useMemo(
    () => [
      { label: translate('Average value'), value: 'value' },
      { label: translate('Average utilization'), value: 'utilization' },
    ],
    [],
  );

  return (
    <ActionDialog
      title={translate('Create horizontal pod autoscaler')}
      submitLabel={translate('Submit')}
      onSubmit={props.handleSubmit(createHPA)}
      submitting={submitting}
    >
      <StringField name="name" label={translate('Name')} required={true} />
      <TextField
        name="description"
        label={translate('Description')}
        required={false}
      />
      <SelectAsyncField
        name="workload"
        label={translate('Workload')}
        required={true}
        loadOptions={loadWorkloads}
        labelKey="name"
        valueKey="url"
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
        name="metric_type"
        label={translate('Metric type')}
        required={true}
        options={metricTypeOptions}
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
