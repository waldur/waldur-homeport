import { useCallback, FunctionComponent } from 'react';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import { MarketplaceKeyValueDialog } from './MarketplaceKeyValueDialog';

export const KeyValueButton: FunctionComponent<{ items; title }> = (props) => {
  const { openDialog } = useModal();

  const showDetails = useCallback(() => {
    const resolve = { items: props.items, title: props.title };
    openDialog(MarketplaceKeyValueDialog, { resolve, size: 'lg' });
  }, [props.items, props.title]);

  return (
    <BaseButton
      variant="tertiary"
      onClick={showDetails}
      label={translate('Show details')}
      size="sm"
    />
  );
};
