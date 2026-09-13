import { PlusIcon } from '@phosphor-icons/react';
import { FunctionComponent, useCallback } from 'react';

import { SidebarCallToAction } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const MarketplacePopup = lazyComponent(() =>
  import('./MarketplacePopup').then((module) => ({
    default: module.MarketplacePopup,
  })),
);

interface MarketplaceTriggerProps {
  disabled?: boolean;
  disabledTooltip?: string;
}

export const MarketplaceTrigger: FunctionComponent<MarketplaceTriggerProps> = ({
  disabled,
  disabledTooltip,
}) => {
  const { openDialog } = useModal();
  const openFormDialog = useCallback(
    () =>
      openDialog(MarketplacePopup, {
        size: 'lg',
      }),
    [],
  );

  return (
    <SidebarCallToAction
      icon={<PlusIcon size={20} weight="bold" />}
      label={translate('Add resource')}
      disabled={disabled}
      disabledTooltip={disabledTooltip}
      onClick={openFormDialog}
      data-testid="add-resource-toggle"
    />
  );
};
