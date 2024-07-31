import { useCallback, FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { MarketplaceKeyValueDialog } from './MarketplaceKeyValueDialog';

export const KeyValueButton: FunctionComponent<{ items; title }> = (props) => {
  const dispatch = useDispatch();

  const showDetails = useCallback(() => {
    const resolve = { items: props.items, title: props.title };
    dispatch(openModalDialog(MarketplaceKeyValueDialog, { resolve }));
  }, [dispatch, props.items, props.title]);

  return (
    <Button variant="link" className="btn-flush" onClick={showDetails}>
      {translate('Show details')}
    </Button>
  );
};
