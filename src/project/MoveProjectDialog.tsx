import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { FormContainer, SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import * as actions from '@waldur/project/actions';
import { MOVE_PROJECT_FORM_ID } from '@waldur/project/constants';
import { MoveToOrganizationAutocomplete } from '@waldur/project/MoveToOrganizationAutocomplete';
import { Project } from '@waldur/workspace/types';

interface MoveProjectDialogOwnProps {
  project: Project;
}

interface FormData {
  organization: { name: string; url: string };
}

const PureMoveProjectDialog: FunctionComponent<any> = (props) => (
  <form onSubmit={props.handleSubmit(props.submitRequest)}>
    <ModalDialog
      title={translate('Move project {projectName}', {
        projectName: props.resolve.project.name,
      })}
      footer={
        <>
          <CloseDialogButton />
          <SubmitButton
            submitting={props.submitting}
            label={translate('Save')}
            disabled={props.invalid}
          />
        </>
      }
    >
      <FormContainer submitting={props.submitting}>
        <MoveToOrganizationAutocomplete isDisabled={props.submitting} />
      </FormContainer>
    </ModalDialog>
  </form>
);

const mapDispatchToProps = (dispatch, ownProps) => ({
  submitRequest: (formData) =>
    actions.moveProject(
      {
        organization: formData.organization,
        project: ownProps.resolve.project,
      },
      dispatch,
    ),
});

const connector = connect(null, mapDispatchToProps);

const enhance = compose(
  connector,
  reduxForm<FormData, MoveProjectDialogOwnProps>({
    form: MOVE_PROJECT_FORM_ID,
  }),
);

export const MoveProjectDialog = enhance(PureMoveProjectDialog);
