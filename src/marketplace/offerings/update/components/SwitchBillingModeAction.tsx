import { MoneyIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { BillingModeEnum, OfferingComponent } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

import { OfferingSectionProps } from '../types';

const SwitchBillingModeDialog = lazyComponent(() =>
  import('./SwitchBillingModeDialog').then((module) => ({
    default: module.SwitchBillingModeDialog,
  })),
);

const detectBillingMode = (
  components: OfferingComponent[],
): BillingModeEnum => {
  const builtins = components.filter((c: any) => c.is_builtin);
  if (builtins.length === 0) return 'monthly';
  if (builtins.every((c: any) => c.billing_type === 'one')) return 'prepaid';
  if (builtins.every((c: any) => c.billing_type === 'usage')) return 'usage';
  return 'monthly';
};

export const SwitchBillingModeAction: FC<OfferingSectionProps> = ({
  offering,
  refetch,
}) => {
  const { openDialog } = useModal();
  const currentBillingMode = detectBillingMode(offering.components || []);

  return (
    <ActionItem
      title={translate('Billing mode')}
      iconNode={<MoneyIcon weight="bold" />}
      action={() => {
        openDialog(SwitchBillingModeDialog, {
          resolve: {
            offering,
            refetch,
            currentMode: currentBillingMode,
          },
        });
      }}
    />
  );
};
