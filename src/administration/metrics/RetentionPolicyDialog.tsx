import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  RetentionPolicy,
  marketplaceMetricRetentionPoliciesCreate,
  marketplaceMetricRetentionPoliciesPartialUpdate,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { NumberGroup, StringGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

type FormValues = Omit<RetentionPolicy, 'uuid'>;

export const RetentionPolicyDialog: FC<{
  resolve: { row?: RetentionPolicy; refetch(): void };
}> = ({ resolve: { row, refetch } }) => {
  const mutation = useManagedMutation<any, any, FormValues>({
    mutationFn: (values) => {
      const body = {
        ...values,
        daily_days: values.daily_days ? Number(values.daily_days) : null,
      };
      return row
        ? marketplaceMetricRetentionPoliciesPartialUpdate({
            path: { uuid: row.uuid },
            body,
          })
        : marketplaceMetricRetentionPoliciesCreate({ body });
    },
    successMessage: translate('Retention policy has been saved.'),
    errorMessage: translate('Unable to save retention policy.'),
    refetch,
  });
  return (
    <Form<FormValues>
      onSubmit={(values) => mutation.mutateAsync(values).catch(() => undefined)}
      initialValues={{
        name: row?.name ?? '',
        raw_days: row?.raw_days ?? 90,
        hourly_days: row?.hourly_days ?? 400,
        daily_days: row?.daily_days ?? null,
      }}
    >
      {({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              row
                ? translate('Edit retention policy')
                : translate('Add retention policy')
            }
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
              name="name"
              label={translate('Name')}
              validate={required}
              required
            />
            <NumberGroup
              name="raw_days"
              label={translate('Raw points kept (days)')}
              min={1}
              validate={required}
              required
            />
            <NumberGroup
              name="hourly_days"
              label={translate('Hourly roll-ups kept (days)')}
              min={1}
              validate={required}
              required
            />
            <NumberGroup
              name="daily_days"
              label={translate('Daily roll-ups kept (days)')}
              description={translate('Empty keeps them forever.')}
              min={1}
            />
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
