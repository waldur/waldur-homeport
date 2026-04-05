import {
  ArrowsClockwiseIcon,
  DatabaseIcon,
  MoneyIcon,
} from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { STORAGE_MODE_OPTIONS } from '@waldur/openstack/constants';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';

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

export const SwitchModesDropdown: FC<OfferingSectionProps> = (props) => {
  const { openDialog } = useModal();

  const builtinComponents = (props.offering.components || []).filter(
    (c: any) => c.is_builtin,
  );
  const currentBillingMode =
    builtinComponents.length > 0 &&
    builtinComponents.every((c: any) => c.billing_type === 'one')
      ? 'prepaid'
      : 'monthly';

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
    </ActionsDropdownComponent>
  );
};
