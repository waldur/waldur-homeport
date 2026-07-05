import { FC } from 'react';

import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { CreditTransactionsList } from './CreditTransactionsList';

interface OwnProps {
  resolve: {
    customerUuid: string;
  };
}

export const CreditTransactionsDialog: FC<OwnProps> = ({
  resolve: { customerUuid },
}) => (
  <ModalDialog
    title={translate('Credit transactions')}
    footer={<CloseDialogButton />}
  >
    <CreditTransactionsList customerUuid={customerUuid} />
  </ModalDialog>
);
