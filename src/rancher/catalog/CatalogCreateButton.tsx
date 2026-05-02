import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { ENV } from '@/core/config';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const CatalogCreateDialog = lazyComponent(() =>
  import('./CatalogCreateDialog').then((module) => ({
    default: module.CatalogCreateDialog,
  })),
);

export const CatalogCreateButton: FC<{ cluster }> = ({ cluster }) => {
  const { openDialog } = useModal();
  if (ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE) {
    return null;
  }
  return (
    <ActionButton
      title={translate('Create')}
      action={() => openDialog(CatalogCreateDialog, { resolve: { cluster } })}
      iconNode={<PlusCircleIcon weight="bold" />}
    />
  );
};
