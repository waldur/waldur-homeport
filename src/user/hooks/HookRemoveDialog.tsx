import * as React from 'react';
import { connect } from 'react-redux';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';
import ActionButton from '@waldur/table-react/ActionButton';

interface HookRemoveDialogProps extends TranslateProps {
  resolve: {
    action: () => void;
  };
  dismiss: () => void;
}

const PureHookRemoveDialog = withTranslation((props: HookRemoveDialogProps) => (
  <ModalDialog
    title={props.translate('Hook removal')}
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
      <CloseDialogButton key={2} className="btn btn-sm btn-default"/>,
    ]}
  >
    {props.translate('Are you sure you would like to delete the hook?')}
  </ModalDialog>
));

const mapDispatchToProps = dispatch => ({
  dismiss: () => dispatch(closeModalDialog()),
});

const HookRemoveDialog = connect(null, mapDispatchToProps)(PureHookRemoveDialog);

export default connectAngularComponent(HookRemoveDialog, ['resolve']);
