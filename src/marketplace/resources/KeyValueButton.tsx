import * as React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { MarketplaceKeyValueDialog } from './MarketplaceKeyValueDialog';

export const KeyValueButton = (props) => {
  const dispatch = useDispatch();

  const showDetails = React.useCallback(() => {
    const resolve = { items: props.items };
    dispatch(openModalDialog(MarketplaceKeyValueDialog, { resolve }));
  }, [dispatch, props.items]);

  return (
    <a onClick={showDetails}>
      {translate('Show details')} <i className="fa fa-external-link" />
    </a>
  );
};
