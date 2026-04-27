import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { KeyValueTable } from './KeyValueTable';

export const MarketplaceKeyValueDialog: FunctionComponent<any> = (props) => {
  return (
    <ModalDialog
      title={props.resolve.title}
      footer={<CloseDialogButton label={translate('Ok')} />}
    >
      <KeyValueTable items={props.resolve.items} />
    </ModalDialog>
  );
};
