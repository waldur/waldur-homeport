import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { marketplaceOfferingUserRolesCreate } from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import { StringField, SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { FormGroup } from '../../FormGroup';

import { ROLE_FORM_ID } from './constants';

export const AddRoleDialog = reduxForm<{}, { resolve: { offering; refetch } }>({
  form: ROLE_FORM_ID,
})((props) => {
  const dispatch = useDispatch();
  const update = useCallback(
    async (formData) => {
      try {
        await marketplaceOfferingUserRolesCreate({
          body: {
            offering: props.resolve.offering.url,
            name: formData.name,
            scope_type: formData.scope_type || '',
          },
        });
        dispatch(showSuccess(translate('Role has been added successfully.')));
        if (props.resolve.refetch) await props.resolve.refetch();
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(showErrorResponse(error, translate('Unable to add role.')));
      }
    },
    [dispatch],
  );

  return (
    <form onSubmit={props.handleSubmit(update)}>
      <ModalDialog
        title={translate('Add role')}
        footer={
          <SubmitButton
            disabled={props.invalid}
            submitting={props.submitting}
            label={translate('Create')}
          />
        }
      >
        <FormGroup label={translate('Name')} required={true}>
          <Field name="name" validate={required} component={StringField} />
        </FormGroup>
        <FormGroup
          label={translate('Scope type')}
          description={translate(
            'Level this role applies at, e.g. "cluster", "project". Leave empty for offering-wide roles.',
          )}
        >
          <Field
            name="scope_type"
            component={StringField}
            placeholder={translate('e.g. cluster, project')}
          />
        </FormGroup>
      </ModalDialog>
    </form>
  );
});
