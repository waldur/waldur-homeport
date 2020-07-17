import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { reduxForm, formValueSelector } from 'redux-form';

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
              type: 'Resource',
              target: {
                type: formData.target_type.value,
                utilization:
                  formData.target_type.value === 'Utilization'
                    ? formData.quantity
                    : null,
                averageValue:
                  formData.target_type.value === 'AverageValue'
                    ? `${formData.quantity}${formData.metric_name.unit}`
                    : null,
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

const FORM_ID = 'RancherHPACreate';

const metricSelector = (state) =>
  formValueSelector(FORM_ID)(state, 'metric_name');

interface MetricOption {
  label: string;
  value: string;
  unit: string;
  unitDisplay: string;
}

export const HPACreateDialog = reduxForm<{}, OwnProps>({
  form: FORM_ID,
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

  const metricNameOptions = React.useMemo<MetricOption[]>(
    () => [
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
    ],
    [],
  );

  const targetTypeOptions = React.useMemo(
    () => [
      { label: translate('Average value'), value: 'AverageValue' },
      { label: translate('Average utilization'), value: 'Utilization' },
    ],
    [],
  );

  const metric: MetricOption = useSelector(metricSelector);

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
        unit={metric ? metric.unitDisplay : undefined}
      />
    </ActionDialog>
  );
});
