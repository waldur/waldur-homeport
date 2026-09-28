import { ClipboardTextIcon } from '@phosphor-icons/react';
import { useForm } from 'react-final-form';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import { FormStepProps } from '../deploy/types';

const OrderSummaryDialog = lazyComponent(() =>
  import('./OrderSummaryDialog').then((module) => ({
    default: module.OrderSummaryDialog,
  })),
);

export const OrderSummaryButton = ({
  offering,
  label = translate('View summary'),
  className = undefined,
  disabled = false,
  disabledReason = undefined,
}: {
  offering: FormStepProps['offering'];
  label?: string;
  className?: string;
  disabled?: boolean;
  disabledReason?: string;
}) => {
  const { openDialog } = useModal();
  const form = useForm();
  return (
    <BaseButton
      variant="tertiary"
      className={className}
      onClick={() =>
        openDialog(OrderSummaryDialog, {
          offering,
          formValues: form.getState().values,
          size: 'sm',
        })
      }
      disabled={disabled}
      disabledReason={disabledReason}
      label={label}
      iconNode={<ClipboardTextIcon weight="bold" />}
      size="lg"
    />
  );
};
