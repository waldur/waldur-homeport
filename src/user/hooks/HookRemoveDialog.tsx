import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { ActionButton } from '@waldur/table/ActionButton';

interface HookRemoveDialogProps {
  resolve: {
    action: () => void;
  };
}

export const HookRemoveDialog = (props: HookRemoveDialogProps) => {
  const dispatch = useDispatch();
  return (
    <ModalDialog
      title={translate('Hook removal')}
      footer={[
        <ActionButton
          key={1}
          title={translate('Yes')}
          action={() => {
            props.resolve.action();
            dispatch(closeModalDialog());
          }}
          className="btn btn-sm btn-danger"
        />,
        <CloseDialogButton key={2} className="btn btn-sm" />,
      ]}
    >
      {translate('Are you sure you would like to delete the hook?')}
    </ModalDialog>
  );
};
