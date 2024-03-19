import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { Call } from '../types';

import { CallRoundsList } from './CallRoundsList';

interface CallRoundsDialogProps {
  resolve: {
    call: Call;
  };
}

export const CallRoundsDialog: React.FC<CallRoundsDialogProps> = ({
  resolve,
}) => {
  return (
    <ModalDialog
      title={translate('Call rounds')}
      footer={<CloseDialogButton label={translate('Done')} />}
    >
      <CallRoundsList call={resolve.call} />
    </ModalDialog>
  );
};
