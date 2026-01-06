import { MagnifyingGlass } from '@phosphor-icons/react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

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
    <Button variant="outline-primary" onClick={handleClick} className="ms-2">
      <MagnifyingGlass size={16} className="me-2" />
      {translate('Discovery')}
    </Button>
  );
};
