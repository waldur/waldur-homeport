import { useCallback, FunctionComponent } from 'react';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

import { MarketplaceKeyValueDialog } from './MarketplaceKeyValueDialog';

export const KeyValueButton: FunctionComponent<{ items; title }> = (props) => {
  const { openDialog } = useModal();

  const showDetails = useCallback(() => {
    const resolve = { items: props.items, title: props.title };
    openDialog(MarketplaceKeyValueDialog, { resolve, size: 'lg' });
  }, [props.items, props.title]);

  return (
    <ActionButton
      variant="link"
      className="btn-flush"
      action={showDetails}
      title={translate('Show details')}
    />
  );
};
