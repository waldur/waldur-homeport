import { connect } from 'react-redux';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { ActionButton } from '@waldur/table/ActionButton';

interface KeyRemoveDialogProps extends TranslateProps {
  resolve: {
    action: () => void;
  };
  dismiss: () => void;
}

const PureKeyRemoveDialog = withTranslation((props: KeyRemoveDialogProps) => (
  <ModalDialog
    title={props.translate('Key removal')}
    footer={[
      <ActionButton
        key={1}
        title={props.translate('Yes')}
        action={() => {
          props.resolve.action();
          props.dismiss();
        }}
        className="btn btn-sm btn-danger"
      />,
      <CloseDialogButton key={2} className="btn btn-sm btn-default" />,
    ]}
  >
    {props.translate('Are you sure you would like to delete the key?')}
  </ModalDialog>
));

const mapDispatchToProps = (dispatch) => ({
  dismiss: () => dispatch(closeModalDialog()),
});

export const KeyRemoveDialog = connect(
  null,
  mapDispatchToProps,
)(PureKeyRemoveDialog);
