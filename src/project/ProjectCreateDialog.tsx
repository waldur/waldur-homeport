import { PlusCircle } from '@phosphor-icons/react';
import { useSelector } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { MetronicModalDialog } from '@waldur/modal/MetronicModalDialog';
import { getWorkspace } from '@waldur/workspace/selectors';
import { WorkspaceType } from '@waldur/workspace/types';

import { ProjectCreateForm, ProjectCreateFormData } from './ProjectCreateForm';

interface ProjectCreateDialogProps {
  onSubmit(formData: ProjectCreateFormData): void;
  initialValues: ProjectCreateFormData;
}

export const ProjectCreateDialog = reduxForm<
  ProjectCreateFormData,
  ProjectCreateDialogProps
>({
  form: 'projectCreate',
})((props) => {
  const workspace = useSelector(getWorkspace);

  return (
    <form onSubmit={props.handleSubmit(props.onSubmit)}>
      <MetronicModalDialog
        title={translate('Create project')}
        subtitle={translate(
          'Provide the required information to set up a new project.',
        )}
        iconNode={<PlusCircle weight="bold" />}
        iconColor="success"
        footer={
          <>
            <CloseDialogButton className="flex-equal" />
            <SubmitButton
              disabled={props.invalid || !props.dirty}
              submitting={props.submitting}
              label={
                workspace === WorkspaceType.USER
                  ? translate('Edit request')
                  : translate('Create')
              }
              className="btn btn-primary flex-equal"
            />
          </>
        }
      >
        <ProjectCreateForm {...props} />
      </MetronicModalDialog>
    </form>
  );
});
