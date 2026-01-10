import { MagnifyingGlass } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const AtlassianDiscoveryDialog = lazyComponent(() =>
  import('./AtlassianDiscoveryDialog').then((module) => ({
    default: module.AtlassianDiscoveryDialog,
  })),
);

export const AtlassianDiscoveryButton = () => {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(
      openModalDialog(AtlassianDiscoveryDialog, {
        size: 'xl',
      }),
    );
  };

  return (
    <ActionButton
      action={handleClick}
      variant="outline-primary"
      className="ms-2"
      iconNode={<MagnifyingGlass size={16} />}
      title={translate('Discovery')}
    />
  );
};
