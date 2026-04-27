import { useCallback, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

import { MarketplaceKeyValueDialog } from './MarketplaceKeyValueDialog';

export const KeyValueButton: FunctionComponent<{ items; title }> = (props) => {
  const dispatch = useDispatch();

  const showDetails = useCallback(() => {
    const resolve = { items: props.items, title: props.title };
    dispatch(
      openModalDialog(MarketplaceKeyValueDialog, { resolve, size: 'lg' }),
    );
  }, [dispatch, props.items, props.title]);

  return (
    <ActionButton
      variant="link"
      className="btn-flush"
      action={showDetails}
      title={translate('Show details')}
    />
  );
};
