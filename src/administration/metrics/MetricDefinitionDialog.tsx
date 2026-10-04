import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  MetricDefinition,
  marketplaceMetricDefinitionsCreate,
  marketplaceMetricDefinitionsPartialUpdate,
  marketplaceMetricRetentionPoliciesList,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import {
  NumberGroup,
  SelectGroup,
  StringGroup,
  SubmitButton,
  TextGroup,
} from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

const KEY = /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)*$/;

const validateKey = (value: string) =>
  required(value) ||
  (KEY.test(value)
    ? undefined
    : translate(
        'Use lowercase dotted names, for example education.course.completions.',
      ));

interface FormValues {
  key: string;
  name: string;
  description?: string;
  unit?: string;
  kind: MetricDefinition['kind'];
  good_direction: MetricDefinition['good_direction'];
  attribute_keys_text?: string;
  max_attribute_values?: number;
  retention_policy?: string | null;
  state?: MetricDefinition['state'];
}

export const MetricDefinitionDialog: FC<{
  resolve: { row?: MetricDefinition; refetch(): void };
}> = ({ resolve: { row, refetch } }) => {
  const isEdit = Boolean(row);
  const { data: policies = [] } = useQuery({
    queryKey: ['metric-retention-policies'],
    queryFn: () =>
      marketplaceMetricRetentionPoliciesList().then(
        (response) => response.data,
      ),
  });
  const mutation = useManagedMutation<any, any, FormValues>({
    mutationFn: ({ attribute_keys_text, ...values }) => {
      const body = {
        ...values,
        attribute_keys: (attribute_keys_text || '')
          .split(',')
          .map((key) => key.trim())
          .filter(Boolean),
      };
      if (row) {
        const { key: _key, ...changes } = body;
        return marketplaceMetricDefinitionsPartialUpdate({
          path: { uuid: row.uuid },
          body: changes,
        });
      }
      return marketplaceMetricDefinitionsCreate({ body });
    },
    successMessage: translate('Metric definition has been saved.'),
    errorMessage: translate('Unable to save metric definition.'),
    refetch,
  });

  return (
    <Form<FormValues>
      onSubmit={(values) => mutation.mutateAsync(values).catch(() => undefined)}
      initialValues={{
        key: row?.key ?? '',
        name: row?.name ?? '',
        description: row?.description ?? '',
        unit: row?.unit ?? '',
        kind: row?.kind ?? 'gauge',
        good_direction: row?.good_direction ?? 'neutral',
        attribute_keys_text: (row?.attribute_keys ?? []).join(', '),
        max_attribute_values: row?.max_attribute_values ?? 100,
        retention_policy: row?.retention_policy ?? null,
        state: row?.state ?? 'active',
      }}
    >
      {({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit metric definition')
                : translate('Add metric definition')
            }
            subtitle={translate(
              'Global definitions can be adopted by every offering.',
            )}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  label={translate('Save')}
                  submitting={submitting}
                  disabled={invalid}
                  variant="primary"
                />
              </>
            }
          >
            <StringGroup
              name="key"
              label={translate('Key')}
              description={translate(
                'What services report against. Cannot be changed later.',
              )}
              validate={isEdit ? undefined : validateKey}
              disabled={isEdit}
              required
            />
            <StringGroup
              name="name"
              label={translate('Name')}
              validate={required}
              required
            />
            <TextGroup name="description" label={translate('Description')} />
            <StringGroup
              name="unit"
              label={translate('Unit')}
              description={translate(
                'UCUM, for example h, % or {learners}. Fixed once data exists.',
              )}
            />
            <SelectGroup
              name="kind"
              label={translate('Kind')}
              description={translate(
                'A gauge is a level read at a moment; a counter counts what happened. Fixed once data exists.',
              )}
              options={[
                { value: 'gauge', label: translate('Gauge') },
                { value: 'counter', label: translate('Counter') },
              ]}
              simpleValue
              required
            />
            <SelectGroup
              name="good_direction"
              label={translate('Good direction')}
              options={[
                { value: 'up', label: translate('Higher is better') },
                { value: 'down', label: translate('Lower is better') },
                { value: 'neutral', label: translate('Neither') },
              ]}
              simpleValue
            />
            <StringGroup
              name="attribute_keys_text"
              label={translate('Attributes')}
              description={translate(
                'Comma-separated names a point may carry, for example course, queue.',
              )}
            />
            <NumberGroup
              name="max_attribute_values"
              label={translate('Distinct values per attribute')}
              description={translate(
                'Per resource; keeps the number of series bounded.',
              )}
              min={1}
            />
            <SelectGroup
              name="retention_policy"
              label={translate('Retention policy')}
              options={policies}
              getOptionValue={(policy) => policy.uuid}
              getOptionLabel={(policy) => policy.name}
              placeholder={translate('Default')}
              isClearable
              simpleValue
            />
            {isEdit && (
              <SelectGroup
                name="state"
                label={translate('State')}
                description={translate(
                  'A deprecated definition can no longer be adopted.',
                )}
                options={[
                  { value: 'active', label: translate('Active') },
                  { value: 'deprecated', label: translate('Deprecated') },
                ]}
                simpleValue
              />
            )}
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
