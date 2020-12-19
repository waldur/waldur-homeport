import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { KeyValueTable } from './KeyValueTable';

export const MarketplaceKeyValueDialog: FunctionComponent<any> = (props) => {
  return (
    <ModalDialog
      title={translate('Request details')}
      footer={<CloseDialogButton />}
    >
      <KeyValueTable items={props.resolve.items} />
    </ModalDialog>
  );
};
