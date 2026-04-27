import {
  ArrowsClockwiseIcon,
  DatabaseIcon,
  MoneyIcon,
} from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/hooks';
import { STORAGE_MODE_OPTIONS, TENANT_TYPE } from '@/openstack/constants';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';

import { OfferingSectionProps } from '../types';

const SwitchBillingModeDialog = lazyComponent(() =>
  import('./SwitchBillingModeDialog').then((module) => ({
    default: module.SwitchBillingModeDialog,
  })),
);

const ChangeStorageModeDialog = lazyComponent(() =>
  import('./ChangeStorageModeDialog').then((module) => ({
    default: module.ChangeStorageModeDialog,
  })),
);

const detectBillingMode = (components: any[]): string => {
  const builtins = components.filter((c: any) => c.is_builtin);
  if (builtins.length === 0) return 'monthly';
  if (builtins.every((c: any) => c.billing_type === 'one')) return 'prepaid';
  if (builtins.every((c: any) => c.billing_type === 'usage')) return 'usage';
  return 'monthly';
};

export const SwitchModesDropdown: FC<OfferingSectionProps> = (props) => {
  const { openDialog } = useModal();

  const currentBillingMode = detectBillingMode(props.offering.components || []);
  const isOpenStack = props.offering.type === TENANT_TYPE;

  return (
    <ActionsDropdownComponent
      labeled
      label={
        <>
          <ArrowsClockwiseIcon weight="bold" className="me-1" />
          {translate('Switch modes')}
        </>
      }
      variant="tertiary"
    >
      <ActionItem
        title={translate('Billing mode')}
        iconNode={<MoneyIcon weight="bold" />}
        action={() => {
          openDialog(SwitchBillingModeDialog, {
            resolve: {
              offering: props.offering,
              refetch: props.refetch,
              currentMode: currentBillingMode,
            },
          });
        }}
      />
      {isOpenStack && (
        <ActionItem
          title={translate('Storage mode')}
          iconNode={<DatabaseIcon weight="bold" />}
          action={() => {
            openDialog(ChangeStorageModeDialog, {
              resolve: {
                offering: props.offering,
                refetch: props.refetch,
                currentMode:
                  props.offering.plugin_options?.storage_mode || 'fixed',
                modes: STORAGE_MODE_OPTIONS,
              },
            });
          }}
        />
      )}
    </ActionsDropdownComponent>
  );
};
