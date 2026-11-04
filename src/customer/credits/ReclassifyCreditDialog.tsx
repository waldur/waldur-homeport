import { FC } from 'react';
import { Form } from 'react-final-form';
import { customerCreditsReclassify } from 'waldur-js-client';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { defaultCurrency } from '@/core/formatCurrency';
import { required } from '@/core/validators';
import { NumberGroup, SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { propVal } from '@/property/propertyFields';

import { isAffiliateProgramOn } from '../affiliate-earnings/utils';

import { previewBalance } from './utils';

interface FormData {
  amount?: number;
  comment?: string;
}

interface OwnProps {
  resolve: {
    credit: {
      uuid: string;
      paid_balance?: number | null;
      granted_balance?: number | null;
    };
    refetch?(): void;
  };
}

/**
 * Marks part of the granted credit as paid, for a prepayment that was
 * recorded as an ordinary grant. The total credit stays the same.
 */
export const ReclassifyCreditDialog: FC<OwnProps> = ({
  resolve: { credit, refetch },
}) => {
  const mutation = useManagedMutation<any, any, FormData>({
    mutationFn: (values) =>
      customerCreditsReclassify({
        path: { uuid: credit.uuid },
        body: { amount: String(values.amount), comment: values.comment },
      }),
    successMessage: translate('Credit has been reclassified as paid.'),
    errorMessage: translate('Unable to reclassify the credit.'),
    refetch,
  });

  const granted = Number(credit.granted_balance ?? 0);
  const validateAmount = (value) => {
    if (required(value)) return required(value);
    const amount = Number(value);
    if (!(amount > 0)) return translate('Amount must be positive.');
    if (amount > granted)
      return translate(
        'Amount exceeds the granted credit balance of {balance}.',
        { balance: defaultCurrency(granted) },
      );
    return undefined;
  };

  return (
    <Form<FormData>
      onSubmit={(values) => mutation.mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid, values }) => {
        // Preview only an amount that may be submitted; anything else would
        // show a balance the credit can never reach.
        const amount = validateAmount(values.amount)
          ? undefined
          : values.amount;
        return (
          <form onSubmit={handleSubmit}>
            <ModalDialog
              title={translate('Reclassify as paid credit')}
              subtitle={
                isAffiliateProgramOn()
                  ? translate(
                      'For a prepayment that was recorded as granted credit. The amount becomes paid credit: it no longer expires, and invoices paid from it count towards the affiliate fee. The total credit stays the same.',
                    )
                  : translate(
                      'For a prepayment that was recorded as granted credit. The amount becomes paid credit, which no longer expires. The total credit stays the same.',
                    )
              }
              footer={
                <>
                  <CloseDialogButton className="min-w-[125px]" />
                  <SubmitButton
                    submitting={submitting}
                    disabled={invalid}
                    label={translate('Reclassify')}
                    variant="primary"
                    className="min-w-[125px]"
                  />
                </>
              }
            >
              <PropertyList>
                <PropertyItem
                  label={translate('Granted credit')}
                  value={propVal.currency(
                    previewBalance(
                      credit.granted_balance,
                      amount,
                      'subtract',
                    ) ?? credit.granted_balance,
                  )}
                />
                <PropertyItem
                  label={translate('Paid credit')}
                  value={propVal.currency(
                    previewBalance(credit.paid_balance, amount) ??
                      credit.paid_balance,
                  )}
                />
              </PropertyList>
              <NumberGroup
                name="amount"
                label={translate('Amount')}
                required
                validate={validateAmount}
                description={translate(
                  'Granted credit to mark as paid, at most the granted credit left.',
                )}
              />
              <TextGroup
                name="comment"
                label={translate('Comment')}
                required
                validate={required}
                placeholder={translate('Why this credit was a prepayment')}
              />
            </ModalDialog>
          </form>
        );
      }}
    />
  );
};
