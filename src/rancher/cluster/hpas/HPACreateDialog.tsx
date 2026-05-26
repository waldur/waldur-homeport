import { useQuery } from '@tanstack/react-query';
import { FC, useEffect, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  rancherHpasCreate,
  rancherNamespacesList,
  rancherWorkloadsList,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { StringField, SelectField, NumberField, TextField } from '@/form';
import { translate } from '@/i18n';
import { ActionDialogFinal } from '@/modal/ActionDialogFinal';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Resource } from '@/resource/types';

import { RANCHER_HPAS_TABLE_ID } from './constants';
import { MetricOption, HPACreateFormData } from './types';
import {
  getMetricNameOptions,
  getTargetTypeOptions,
  serializeMetrics,
} from './utils';

interface HPACreateDialogProps {
  resolve: {
    cluster: Resource;
  };
}

export const HPACreateDialog: FC<HPACreateDialogProps> = (props) => {
  const { mutate, isPending } = useManagedMutation<any, any, HPACreateFormData>(
    {
      mutationFn: (formData) =>
        rancherHpasCreate({
          body: {
            name: formData.name,
            description: formData.description,
            workload: formData.workload.url,
            min_replicas: formData.min_replicas,
            max_replicas: formData.max_replicas,
            metrics: serializeMetrics(formData),
          },
        }),
      successMessage: translate('Horizontal pod autoscaler has been created.'),
      errorMessage: translate('Unable to create horizontal pod autoscaler.'),
      invalidateQueries: [{ queryKey: ['table', RANCHER_HPAS_TABLE_ID] }],
    },
  );

  const { isLoading: loading, data: value } = useQuery({
    queryKey: ['HPACreateDialog', props.resolve.cluster.uuid],

    queryFn: async () => {
      const namespaces = await getAllPages((page) =>
        rancherNamespacesList({
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
            cluster_uuid: props.resolve.cluster.uuid,
            o: ['name'],
          },
        }),
      );
      const workloads = await getAllPages((page) =>
        rancherWorkloadsList({
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
            cluster_uuid: props.resolve.cluster.uuid,
            o: ['name'],
          },
        }),
      );
      return { namespaces, workloads };
    },
  });

  const metricNameOptions = useMemo<MetricOption[]>(getMetricNameOptions, []);
  const targetTypeOptions = useMemo(getTargetTypeOptions, []);

  return (
    <Form<HPACreateFormData>
      onSubmit={mutate}
      initialValues={{
        min_replicas: 1,
        max_replicas: 10,
      }}
      render={({ handleSubmit, invalid, submitting, values, form }) => {
        const namespace = values['namespace'] as any;
        const metric = values.metric_name as any;

        // Clear workload selection after namespace selection has been changed
        useEffect(() => {
          if (namespace) {
            form.change('workload', null);
          }
        }, [form, namespace]);

        const validWorkloads = useMemo(
          () =>
            namespace &&
            value?.workloads.filter(
              (workload) => workload.namespace_uuid === namespace.uuid,
            ),
          [namespace],
        );

        return (
          <ActionDialogFinal
            title={translate('Create horizontal pod autoscaler')}
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
          </ActionDialogFinal>
        );
      }}
    />
  );
};
