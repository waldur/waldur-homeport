import * as React from 'react';

import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

import { KeyValueTable } from './KeyValueTable';

export const MarketplaceKeyValueDialog = props => {
  return (
    <ModalDialog
      title={translate('Annotations & labels')}
      footer={<CloseDialogButton />}
    >
      <KeyValueTable items={props.resolve.items} />
    </ModalDialog>
  );
};

export default connectAngularComponent(MarketplaceKeyValueDialog, ['resolve']);
