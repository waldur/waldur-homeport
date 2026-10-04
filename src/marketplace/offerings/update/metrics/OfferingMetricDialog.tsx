import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  MetricDefinition,
  OfferingMetric,
  marketplaceMetricDefinitionsList,
  marketplaceOfferingMetricsCreate,
  marketplaceOfferingMetricsList,
  marketplaceOfferingMetricsPartialUpdate,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { SelectGroup, StringGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import {
  getKindLabel,
  getProjectAggregationOptions,
} from '@/marketplace/metrics/options';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface FormValues {
  definition?: string;
  display_name?: string;
  project_aggregation: OfferingMetric['project_aggregation'];
}

interface OfferingMetricDialogResolve {
  offering?: { uuid: string; customer_uuid?: string };
  row?: OfferingMetric;
  refetch(): void;
}

const definitionLabel = (definition: MetricDefinition) =>
  `${definition.name} · ${definition.key}` +
  (definition.unit ? ` (${definition.unit})` : '');

export const OfferingMetricDialog: FC<{
  resolve: OfferingMetricDialogResolve;
}> = ({ resolve: { offering, row, refetch } }) => {
  const isEdit = Boolean(row);
  // The catalogue an offering can adopt from: global definitions and the
  // provider's own private ones; the backend only lists those to the provider.
  const { data: definitions = [], isLoading } = useQuery({
    queryKey: ['metric-definitions', 'adoptable'],
    queryFn: () =>
      marketplaceMetricDefinitionsList({
        query: { state: 'active', page_size: 200 },
      }).then((response) => response.data),
    enabled: !isEdit,
  });
  // Every metric the offering already adopts, not just the table's page.
  const { data: adopted = [] } = useQuery({
    queryKey: ['offering-metrics', 'adopted', offering?.uuid],
    queryFn: () =>
      marketplaceOfferingMetricsList({
        query: { offering_uuid: offering.uuid, page_size: 500 },
      }).then((response) => response.data.map((metric) => metric.key)),
    enabled: !isEdit && Boolean(offering),
  });
  const options = useMemo(
    () =>
      definitions.filter(
        (definition) =>
          !adopted.includes(definition.key) &&
          (!definition.owner_customer ||
            definition.owner_customer === offering?.customer_uuid),
      ),
    [definitions, adopted, offering],
  );

  const mutation = useManagedMutation<any, any, FormValues>({
    mutationFn: (values) =>
      row
        ? marketplaceOfferingMetricsPartialUpdate({
            path: { uuid: row.uuid },
            body: {
              display_name: values.display_name || '',
              project_aggregation: values.project_aggregation,
            },
          })
        : marketplaceOfferingMetricsCreate({
            body: {
              offering: offering.uuid,
              definition: values.definition,
              display_name: values.display_name || '',
              project_aggregation: values.project_aggregation,
            },
          }),
    successMessage: isEdit
      ? translate('Metric has been updated.')
      : translate('Metric has been adopted.'),
    errorMessage: isEdit
      ? translate('Unable to update metric.')
      : translate('Unable to adopt metric.'),
    refetch,
  });

  return (
    <Form<FormValues>
      onSubmit={(values) => mutation.mutateAsync(values).catch(() => undefined)}
      initialValues={{
        display_name: row?.display_name ?? '',
        project_aggregation: row?.project_aggregation ?? 'sum',
      }}
    >
      {({ handleSubmit, submitting, invalid, values }) => {
        const chosen = isEdit
          ? row
          : definitions.find((d) => d.uuid === values.definition);
        return (
          <form onSubmit={handleSubmit}>
            <ModalDialog
              title={
                isEdit ? translate('Edit metric') : translate('Adopt metric')
              }
              subtitle={translate(
                'A service can only report the metrics its offering adopts.',
              )}
              footer={
                <>
                  <CloseDialogButton />
                  <SubmitButton
                    label={isEdit ? translate('Save') : translate('Adopt')}
                    submitting={submitting}
                    disabled={invalid}
                    variant="primary"
                  />
                </>
              }
            >
              {!isEdit && (
                <SelectGroup
                  name="definition"
                  label={translate('Metric from the catalogue')}
                  options={options}
                  getOptionValue={(option: MetricDefinition) => option.uuid}
                  getOptionLabel={definitionLabel}
                  isLoading={isLoading}
                  noOptionsMessage={() =>
                    translate('No catalogue metric left to adopt.')
                  }
                  validate={required}
                  simpleValue
                  required
                />
              )}
              {chosen && (
                <p className="text-muted fs-7">
                  {getKindLabel(chosen.kind)}
                  {'description' in chosen && chosen.description
                    ? ` · ${chosen.description}`
                    : ''}
                </p>
              )}
              <StringGroup
                name="display_name"
                label={translate('Display name')}
                description={translate("Empty shows the catalogue's name.")}
              />
              <SelectGroup
                name="project_aggregation"
                label={translate('Figure across a project')}
                description={translate(
                  'How the figures of a project’s resources combine. Counted amounts are always added up.',
                )}
                options={getProjectAggregationOptions().filter(
                  (option) =>
                    chosen?.kind !== 'counter' || option.value === 'sum',
                )}
                simpleValue
                required
              />
            </ModalDialog>
          </form>
        );
      }}
    </Form>
  );
};
