import { FC } from 'react';
import { Form } from 'react-final-form';
import { customerCreditsTopUp } from 'waldur-js-client';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { defaultCurrency } from '@/core/formatCurrency';
import { required } from '@/core/validators';
import { NumberGroup, StringGroup, SubmitButton, TextGroup } from '@/form';
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
  payment_reference?: string;
}

interface OwnProps {
  resolve: {
    credit: { uuid: string; paid_balance?: number | null };
    refetch?(): void;
  };
}

/**
 * Records a prepayment the organization has made, outside Waldur, as paid
 * credit: it pays its invoices like any other credit, and the part of an
 * invoice it pays counts towards the affiliate fee. A negative amount reverses
 * a prepayment recorded by mistake.
 */
export const TopUpCreditDialog: FC<OwnProps> = ({
  resolve: { credit, refetch },
}) => {
  const mutation = useManagedMutation<any, any, FormData>({
    mutationFn: (values) =>
      customerCreditsTopUp({
        path: { uuid: credit.uuid },
        body: {
          amount: String(values.amount),
          comment: values.comment,
          payment_reference: values.payment_reference ?? '',
        },
      }),
    successMessage: translate('Credit has been topped up.'),
    errorMessage: translate('Unable to top up the credit.'),
    refetch,
  });

  const paid = Number(credit.paid_balance ?? 0);
  const validateAmount = (value) => {
    if (required(value)) return required(value);
    const amount = Number(value);
    if (Number.isNaN(amount) || amount === 0)
      return translate('Amount must not be zero.');
    if (amount < 0 && -amount > paid)
      return translate(
        'A reversal cannot exceed the paid credit of {balance}.',
        { balance: defaultCurrency(paid) },
      );
    return undefined;
  };

  return (
    <Form<FormData>
      onSubmit={(values) => mutation.mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid, values }) => {
        // Preview only an amount that may be submitted.
        const amount = validateAmount(values.amount)
          ? undefined
          : values.amount;
        return (
          <form onSubmit={handleSubmit}>
            <ModalDialog
              title={translate('Top up credit')}
              subtitle={
                isAffiliateProgramOn()
                  ? translate(
                      'Record a prepayment the organization has made as paid credit. Paid credit is spent after granted credit, does not expire, and invoices paid from it count towards the affiliate fee.',
                    )
                  : translate(
                      'Record a prepayment the organization has made as paid credit. Paid credit is spent after granted credit and does not expire.',
                    )
              }
              footer={
                <>
                  <CloseDialogButton className="min-w-[125px]" />
                  <SubmitButton
                    submitting={submitting}
                    disabled={invalid}
                    label={translate('Top up')}
                    variant="primary"
                    className="min-w-[125px]"
                  />
                </>
              }
            >
              <PropertyList>
                <PropertyItem
                  label={translate('Current paid credit')}
                  value={propVal.currency(credit.paid_balance)}
                />
                <PropertyItem
                  label={translate('New paid credit')}
                  value={propVal.currency(
                    previewBalance(credit.paid_balance, amount),
                  )}
                />
              </PropertyList>
              <NumberGroup
                name="amount"
                label={translate('Amount')}
                required
                validate={validateAmount}
                description={translate(
                  'The prepayment received from the organization. A negative amount reverses a prepayment recorded by mistake.',
                )}
              />
              <StringGroup
                name="payment_reference"
                label={translate('Payment reference')}
                description={translate(
                  'Bank transfer or payment identifier, kept in the credit transactions.',
                )}
              />
              <TextGroup
                name="comment"
                label={translate('Comment')}
                required
                validate={required}
                placeholder={translate('What the prepayment is for')}
              />
            </ModalDialog>
          </form>
        );
      }}
    />
  );
};
