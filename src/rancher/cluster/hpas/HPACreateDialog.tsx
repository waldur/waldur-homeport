import { useState, useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAsync } from 'react-use';
import { reduxForm, formValueSelector, change } from 'redux-form';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { StringField, SelectField, NumberField, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { ActionDialog } from '@waldur/modal/ActionDialog';
import { closeModalDialog } from '@waldur/modal/actions';
import { createHPA, listWorkloads, listNamespaces } from '@waldur/rancher/api';
import { Resource } from '@waldur/resource/types';
import { showError, showSuccess } from '@waldur/store/notify';
import { RootState } from '@waldur/store/reducers';
import { createEntity } from '@waldur/table/actions';

import { MetricOption, HPACreateFormData } from './types';
import {
  getMetricNameOptions,
  getTargetTypeOptions,
  serializeMetrics,
  FORM_ID,
  metricSelector,
} from './utils';

interface OwnProps {
  resolve: {
    cluster: Resource;
  };
}

const useHPACreateDialog = (cluster) => {
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch();
  const callback = useCallback(
    async (formData: HPACreateFormData) => {
      try {
        setSubmitting(true);
        const response = await createHPA({
          name: formData.name,
          description: formData.description,
          workload: formData.workload.url,
          min_replicas: formData.min_replicas,
          max_replicas: formData.max_replicas,
          metrics: serializeMetrics(formData),
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

const getNamespace = (state: RootState) =>
  formValueSelector(FORM_ID)(state, 'namespace');

export const HPACreateDialog = reduxForm<{}, OwnProps>({
  form: FORM_ID,
  initialValues: {
    min_replicas: 1,
    max_replicas: 10,
  },
})((props) => {
  const { submitting, createHPA } = useHPACreateDialog(props.resolve.cluster);

  const { loading, value } = useAsync(async () => {
    const params = { cluster_uuid: props.resolve.cluster.uuid, o: 'name' };
    const namespaces = await listNamespaces({ params });
    const workloads = await listWorkloads({ params });
    return { namespaces, workloads };
  }, [props.resolve.cluster.uuid]);

  const namespace = useSelector(getNamespace);

  const dispatch = useDispatch();

  // Clear workload selection after namespace selection has been changed
  useEffect(() => {
    if (namespace) {
      dispatch(change(FORM_ID, 'workload', null));
    }
  }, [dispatch, namespace]);

  const validWorkloads = useMemo(
    () =>
      namespace &&
      value?.workloads.filter(
        (workload) => workload.namespace_uuid === namespace.uuid,
      ),
    [value, namespace],
  );

  const metricNameOptions = useMemo<MetricOption[]>(getMetricNameOptions, []);

  const targetTypeOptions = useMemo(getTargetTypeOptions, []);

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
      <SelectField
        name="namespace"
        label={translate('Namespace')}
        required={true}
        getOptionValue={(option) => option.url}
        getOptionLabel={(option) => option.name}
        options={value?.namespaces}
        isLoading={loading}
        isClearable={true}
      />
      <SelectField
        name="workload"
        label={translate('Workload')}
        required={true}
        getOptionValue={(option) => option.url}
        getOptionLabel={(option) => option.name}
        options={validWorkloads}
        isLoading={loading}
        isDisabled={!namespace}
        isClearable={true}
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
    </ActionDialog>
  );
});
