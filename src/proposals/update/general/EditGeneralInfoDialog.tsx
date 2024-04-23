import { pick } from 'lodash';
import { useCallback } from 'react';
import { connect } from 'react-redux';
import { SubmissionError, reduxForm } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { required } from '@waldur/core/validators';
import { SelectField, SubmitButton } from '@waldur/form';
import { FormContainer } from '@waldur/form/FormContainer';
import { MarkdownField } from '@waldur/form/MarkdownField';
import { StringField } from '@waldur/form/StringField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { RoleEnum } from '@waldur/permissions/enums';
import { Role } from '@waldur/permissions/types';
import { getProjectRoles } from '@waldur/permissions/utils';
import { updateCall } from '@waldur/proposals/api';
import { EDIT_CALL_GENERAL_FORM_ID } from '@waldur/proposals/constants';
import { EditCallProps } from '@waldur/proposals/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

interface FormData {
  name: string;
  description: string;
  default_project_role: Role;
}

export const EditGeneralInfoDialog = connect<
  {},
  {},
  { resolve: EditCallProps }
>((_, ownProps) => ({
  initialValues:
    ownProps.resolve.name === 'default_project_role'
      ? {
          default_project_role:
            ENV.roles.find(
              (role) =>
                role.name == ownProps.resolve.call.default_project_role_name,
            ) || ENV.roles.find((role) => role.name == RoleEnum.PROJECT_ADMIN),
        }
      : pick(ownProps.resolve.call, ownProps.resolve.name),
}))(
  reduxForm<FormData, { resolve: EditCallProps }>({
    form: EDIT_CALL_GENERAL_FORM_ID,
  })((props) => {
    const processRequest = useCallback(
      (values: FormData, dispatch) => {
        return updateCall(
          {
            ...values,
            default_project_role: values.default_project_role?.uuid,
          },
          props.resolve.call.uuid,
        )
          .then(() => {
            props.resolve.refetch();
            dispatch(showSuccess(translate('The call has been updated.')));
            dispatch(closeModalDialog());
          })
          .catch((e) => {
            dispatch(showErrorResponse(e, translate('Unable to update call.')));
            if (e.response && e.response.status === 400) {
              throw new SubmissionError(e.response.data);
            }
          });
      },
      [props.resolve],
    );

    return (
      <form onSubmit={props.handleSubmit(processRequest)}>
        <ModalDialog
          title={props.resolve.title}
          closeButton
          footer={
            <>
              <SubmitButton
                disabled={props.invalid}
                submitting={props.submitting}
                label={translate('Save')}
              />
              <CloseDialogButton />
            </>
          }
        >
          <FormContainer submitting={props.submitting}>
            {props.resolve.name === 'name' && (
              <StringField
                label={translate('Name')}
                name="name"
                required
                validate={required}
              />
            )}
            {props.resolve.name === 'description' && (
              <MarkdownField
                label={translate('Description')}
                name="description"
                required={false}
                verticalLayout
              />
            )}
            {props.resolve.name === 'reference_code' && (
              <StringField
                label={translate('Reference code')}
                name="reference_code"
                required={false}
              />
            )}
            {props.resolve.name === 'default_project_role' && (
              <SelectField
                label={translate('Default project role')}
                name="default_project_role"
                options={getProjectRoles()}
                getOptionLabel={(role: Role) => role.description || role.name}
                getOptionValue={({ uuid }) => uuid}
              />
            )}
          </FormContainer>
        </ModalDialog>
      </form>
    );
  }),
);
