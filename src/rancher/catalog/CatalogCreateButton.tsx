import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { ENV } from '@/core/config';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const CatalogCreateDialog = lazyComponent(() =>
  import('./CatalogCreateDialog').then((module) => ({
    default: module.CatalogCreateDialog,
  })),
);

const createCatalogDialog = (cluster) =>
  openModalDialog(CatalogCreateDialog, { resolve: { cluster } });

export const CatalogCreateButton: FC<{ cluster }> = ({ cluster }) => {
  const dispatch = useDispatch();
  if (ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE) {
    return null;
  }
  return (
    <ActionButton
      title={translate('Create')}
      action={() => dispatch(createCatalogDialog(cluster))}
      iconNode={<PlusCircleIcon weight="bold" />}
    />
  );
};
