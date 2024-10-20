import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { ActionButton } from '@waldur/table/ActionButton';

interface ProjectRemoveDialogProps {
  resolve: {
    action: () => void;
    projectName: string;
  };
  dismiss: () => void;
}

const PureProjectRemoveDialog = (props: ProjectRemoveDialogProps) => (
  <ModalDialog
    title={translate('Project removal')}
    footer={[
      <ActionButton
        key={1}
        title={translate('Yes')}
        action={() => {
          props.resolve.action();
          props.dismiss();
        }}
        className="btn btn-sm btn-danger"
      />,
      <CloseDialogButton key={2} className="btn btn-sm" />,
    ]}
  >
    {translate('Are you sure you would like to delete project {projectName}?', {
      projectName: props.resolve.projectName,
    })}
  </ModalDialog>
);

const mapDispatchToProps = (dispatch) => ({
  dismiss: () => dispatch(closeModalDialog()),
});

export const ProjectRemoveDialog = connect(
  null,
  mapDispatchToProps,
)(PureProjectRemoveDialog);
