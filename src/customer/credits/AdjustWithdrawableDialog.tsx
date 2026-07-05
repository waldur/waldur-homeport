import { FC } from 'react';
import { Form } from 'react-final-form';
import { customerCreditsAdjustWithdrawable } from 'waldur-js-client';

import { defaultCurrency } from '@/core/formatCurrency';
import { required } from '@/core/validators';
import { NumberGroup, SubmitButton, TextGroup } from '@/form';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { renderFieldOrDash } from '@/table/utils';

interface FormData {
  amount?: number;
  comment?: string;
}

interface OwnProps {
  resolve: {
    credit: { uuid: string; withdrawable_balance?: number | null };
    refetch?(): void;
  };
}

export const AdjustWithdrawableDialog: FC<OwnProps> = ({
  resolve: { credit, refetch },
}) => {
  const mutation = useManagedMutation<any, any, FormData>({
    mutationFn: (values) =>
      customerCreditsAdjustWithdrawable({
        path: { uuid: credit.uuid },
        body: {
          amount: String(values.amount),
          comment: values.comment,
        },
      }),
    successMessage: translate('Withdrawable balance has been adjusted.'),
    errorMessage: translate('Unable to adjust the withdrawable balance.'),
    refetch,
  });

  const current = credit.withdrawable_balance;

  return (
    <Form<FormData>
      onSubmit={(values) => mutation.mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid, values }) => {
        // The number field emits a raw string, so an empty field is '' (not
        // undefined) — treat it as "no input" so the preview shows a dash
        // rather than "New = Current".
        const hasAmount =
          values.amount !== undefined &&
          values.amount !== null &&
          String(values.amount) !== '';
        const amount = Number(values.amount);
        const newBalance =
          current != null && hasAmount && !Number.isNaN(amount)
            ? Number(current) + amount
            : undefined;
        return (
          <form onSubmit={handleSubmit}>
            <ModalDialog
              title={translate('Adjust withdrawable balance')}
              footer={
                <>
                  <CloseDialogButton className="min-w-125px" />
                  <SubmitButton
                    submitting={submitting}
                    disabled={invalid}
                    label={translate('Save')}
                    className="btn btn-primary min-w-125px"
                  />
                </>
              }
            >
              <FormTable>
                <FormTable.Item
                  label={translate('Current withdrawable balance')}
                  value={renderFieldOrDash(
                    current != null ? defaultCurrency(current) : null,
                  )}
                />
                <FormTable.Item
                  label={translate('New withdrawable balance')}
                  value={renderFieldOrDash(
                    newBalance != null ? defaultCurrency(newBalance) : null,
                  )}
                />
              </FormTable>
              <NumberGroup
                name="amount"
                label={translate('Amount')}
                required
                validate={required}
                description={translate(
                  'Positive to grant withdrawable credit, negative to reduce it. Changes the total credit value by the same amount.',
                )}
              />
              <TextGroup
                name="comment"
                label={translate('Comment')}
                required
                validate={required}
                placeholder={translate('Reason for the adjustment')}
              />
            </ModalDialog>
          </form>
        );
      }}
    />
  );
};
