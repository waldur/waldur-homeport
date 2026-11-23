import { ArrowsClockwiseIcon } from '@phosphor-icons/react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import type { BillingAction } from './BillingChangesWizard';

const BillingChangesWizard = lazyComponent(() =>
  import('./BillingChangesWizard').then((module) => ({
    default: module.BillingChangesWizard,
  })),
);

interface BillingSyncButtonProps {
  refetch?: () => void;
  action?: BillingAction;
  label?: string;
}

/** Opens the Billing changes wizard: choose, preview, then apply. */
export const BillingSyncButton = ({
  refetch,
  action,
  label,
}: BillingSyncButtonProps) => {
  const { openDialog } = useModal();

  return (
    <BaseButton
      onClick={() =>
        openDialog(BillingChangesWizard, {
          resolve: { refetch, action },
          size: 'xl',
        })
      }
      label={label || translate('Billing changes')}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      variant="primary"
      size="lg"
    />
  );
};
