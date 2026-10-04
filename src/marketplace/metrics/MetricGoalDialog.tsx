import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  MetricGoal,
  marketplaceMetricGoalsCreate,
  marketplaceMetricGoalsDestroy,
  marketplaceMetricGoalsPartialUpdate,
} from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { required } from '@/core/validators';
import { NumberGroup, SelectGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import {
  formatUnit,
  getComparatorOptions,
  getGoalPeriodOptions,
} from './options';

interface FormValues {
  comparator: MetricGoal['comparator'];
  value: number | string;
  period: MetricGoal['period'];
}

interface MetricGoalDialogResolve {
  offeringMetric: {
    uuid: string;
    name: string;
    unit?: string;
    good_direction?: string;
  };
  // Empty sets the offering's default goal.
  project?: { uuid: string; name: string };
  goal?: MetricGoal | null;
  refetch(): void;
}

export const MetricGoalDialog: FC<{ resolve: MetricGoalDialogResolve }> = ({
  resolve: { offeringMetric, project, goal, refetch },
}) => {
  const save = useManagedMutation<any, any, FormValues>({
    mutationFn: (values) => {
      const body = { ...values, value: String(values.value) };
      return goal
        ? marketplaceMetricGoalsPartialUpdate({
            path: { uuid: goal.uuid },
            body,
          })
        : marketplaceMetricGoalsCreate({
            body: {
              ...body,
              offering_metric: offeringMetric.uuid,
              project: project?.uuid ?? null,
            },
          });
    },
    successMessage: translate('Goal has been saved.'),
    errorMessage: translate('Unable to save goal.'),
    refetch,
  });
  const remove = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceMetricGoalsDestroy({ path: { uuid: goal.uuid } }),
    successMessage: translate('Goal has been removed.'),
    errorMessage: translate('Unable to remove goal.'),
    refetch,
    confirmation: {
      title: translate('Remove this goal?'),
      body: project
        ? translate("The project falls back to the offering's default goal.")
        : translate('Projects without their own goal will have none.'),
      options: { forDeletion: true, positiveButton: translate('Remove') },
    },
  });

  return (
    <Form<FormValues>
      onSubmit={(values) => save.mutateAsync(values).catch(() => undefined)}
      initialValues={{
        // A lower-is-better metric's goal is a ceiling.
        comparator:
          goal?.comparator ??
          (offeringMetric.good_direction === 'down' ? 'le' : 'ge'),
        value: goal ? Number(goal.value) : '',
        period: goal?.period ?? 'month',
      }}
    >
      {({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              project
                ? translate('Goal for {metric} in {project}', {
                    metric: offeringMetric.name,
                    project: project.name,
                  })
                : translate('Default goal for {metric}', {
                    metric: offeringMetric.name,
                  })
            }
            subtitle={
              project
                ? translate("Overrides the offering's default goal.")
                : translate('Applies to every project without its own goal.')
            }
            footer={
              <>
                {goal && (
                  <BaseButton
                    variant="danger"
                    label={translate('Remove goal')}
                    pending={remove.isPending}
                    onClick={() => remove.mutate()}
                  />
                )}
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
            <SelectGroup
              name="comparator"
              label={translate('The figure should be')}
              options={getComparatorOptions()}
              simpleValue
              required
            />
            <NumberGroup
              name="value"
              label={translate('Value')}
              unit={formatUnit(offeringMetric.unit)}
              step="any"
              validate={required}
              required
            />
            <SelectGroup
              name="period"
              label={translate('Over')}
              options={getGoalPeriodOptions()}
              simpleValue
              required
            />
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
