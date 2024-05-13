import { PlusCircle } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const CatalogCreateDialog = lazyComponent(
  () => import('./CatalogCreateDialog'),
  'CatalogCreateDialog',
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
      iconNode={<PlusCircle />}
    />
  );
};
