import { FC } from 'react';
import { Form, useFormState } from 'react-final-form';
import {
  CompensateInEnum,
  ProjectCredit,
  projectCreditsPartialUpdate,
  projectCreditsPayEarlierInvoices,
} from 'waldur-js-client';

import { PaymentPreview } from '@/customer/cost-policies/PayEarlierInvoicesPreview';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { EarlierInvoices } from '@/project/manage/EarlierInvoices';
import {
  EARLIER_INVOICES_FIELDS,
  EarlierInvoicesField,
} from '@/project/manage/EarlierInvoicesField';

interface CompensationPolicyValues {
  pay_earlier_invoices?: boolean;
  earlier_invoices_from?: string | null;
  earlier_invoices_until?: string | null;
  earlier_invoices_compensate_in?: CompensateInEnum;
}

/** What saving would pay now, for the settings as they stand in the form. */
const FormPaymentPreview: FC<{ credit: ProjectCredit }> = ({ credit }) => {
  const { values } = useFormState<CompensationPolicyValues>({
    subscription: { values: true },
  });
  if (!values.pay_earlier_invoices) {
    return null;
  }
  return (
    <section className="mt-2">
      <h3 className="text-base font-semibold mb-2">
        {translate('Saving pays now')}
      </h3>
      <PaymentPreview
        creditUuid={credit.uuid}
        compensateIn={values.earlier_invoices_compensate_in ?? 'current_month'}
        period={{
          from: values.earlier_invoices_from,
          until: values.earlier_invoices_until,
        }}
      />
    </section>
  );
};

/** The earlier invoices, with the months the form's settings would pay. */
const FormEarlierInvoices: FC<{ credit: ProjectCredit }> = ({ credit }) => {
  const { values } = useFormState<CompensationPolicyValues>({
    subscription: { values: true },
  });
  return (
    <EarlierInvoices
      credit={credit}
      hideAdvice
      period={{
        from: values.earlier_invoices_from,
        until: values.earlier_invoices_until,
      }}
    />
  );
};

/** Staff only: whether a project credit also pays the cost of the project's
 * earlier, closed invoices that no credit covered, for which months, and on
 * which invoice the compensation goes. */
export const CompensationPolicyDialog: FC<{
  resolve: { credit: ProjectCredit; refetch?(): void };
}> = ({ resolve }) => {
  const { credit } = resolve;
  const initialValues: CompensationPolicyValues = Object.fromEntries(
    EARLIER_INVOICES_FIELDS.map((field) => [field, credit[field]]),
  );

  const save = useManagedMutation({
    // Turning it on pays at once, through the action that previews the same
    // payment; turning it off only changes the settings.
    mutationFn: (values: CompensationPolicyValues): Promise<unknown> =>
      values.pay_earlier_invoices
        ? projectCreditsPayEarlierInvoices({
            path: { uuid: credit.uuid },
            body: {
              compensate_in: values.earlier_invoices_compensate_in,
              earlier_invoices_from: values.earlier_invoices_from || null,
              earlier_invoices_until: values.earlier_invoices_until || null,
            },
          })
        : projectCreditsPartialUpdate({
            path: { uuid: credit.uuid },
            body: {
              pay_earlier_invoices: false,
              earlier_invoices_from: values.earlier_invoices_from || null,
              earlier_invoices_until: values.earlier_invoices_until || null,
              earlier_invoices_compensate_in:
                values.earlier_invoices_compensate_in,
            },
          }),
    successMessage: translate('Compensation policy has been saved.'),
    errorMessage: translate('Compensation policy could not be saved.'),
    invalidateQueries: [
      { queryKey: ['ProjectCreditEarlierInvoices'] },
      { queryKey: ['ProjectCreditData'] },
      { queryKey: ['PayEarlierInvoicesPreview'] },
      { queryKey: ['CostPolicyDetailsProjectCredit'] },
    ],
    refetch: resolve.refetch,
  });

  return (
    <Form<CompensationPolicyValues>
      initialValues={initialValues}
      onSubmit={(values) => save.mutateAsync(values)}
      render={({ handleSubmit, submitting, dirty }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Compensation policy')}
            subtitle={translate(
              '{project}: whether this credit also pays earlier invoices that no credit covered.',
              { project: credit.project_name },
            )}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  disabled={!dirty}
                  submitting={submitting}
                  label={translate('Save')}
                  variant="primary"
                />
              </>
            }
          >
            {EARLIER_INVOICES_FIELDS.map((field) => (
              <EarlierInvoicesField key={field} name={field} />
            ))}
            <FormPaymentPreview credit={credit} />
            <FormEarlierInvoices credit={credit} />
          </ModalDialog>
        </form>
      )}
    />
  );
};
