import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Field, reduxForm } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import { required } from '@waldur/core/validators';
import { SubmitButton } from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { createResourceUser, getUsers } from '@waldur/marketplace/common/api';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { USER_FORM_ID } from './constants';

export const AddUserDialog = reduxForm<
  {},
  { resolve: { resource; offering; refetch } }
>({
  form: USER_FORM_ID,
})((props) => {
  const dispatch = useDispatch();
  const update = useCallback(
    async (formData) => {
      try {
        await createResourceUser({
          resource: props.resolve.resource.url,
          user: formData.user.url,
          role: formData.role.url,
        });
        dispatch(
          showSuccess(translate('User has been assigned successfully.')),
        );
        if (props.resolve.refetch) await props.resolve.refetch();
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(showErrorResponse(error, translate('Unable to assign user.')));
      }
    },
    [dispatch],
  );

  const loadUsers = useCallback(
    (query, prevOptions, page) =>
      getUsers({
        full_name: query,
        project_uuid: props.resolve.resource.project_uuid,
        field: ['full_name', 'email', 'url', 'uuid'],
        o: 'full_name',
        page,
        page_size: ENV.pageSize,
      }).then((response) =>
        returnReactSelectAsyncPaginateObject(response, prevOptions, page),
      ),
    [props.resolve.resource],
  );

  return (
    <form onSubmit={props.handleSubmit(update)}>
      <Modal.Header>
        <Modal.Title>{translate('Assign user')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormGroup label={translate('User')} required={true}>
          <Field
            name="user"
            validate={required}
            component={AsyncSelectField}
            loadOptions={loadUsers}
            getOptionLabel={({ full_name, email }) => `${full_name} (${email})`}
            getOptionValue={({ uuid }) => uuid}
          />
        </FormGroup>
        <FormGroup label={translate('Role')} required={true}>
          <Field
            name="role"
            validate={required}
            component={(componentProp) => (
              <Select
                value={componentProp.input.value}
                onChange={(value) => componentProp.input.onChange(value)}
                options={props.resolve.offering.roles}
                getOptionValue={(option) => option.uuid}
                getOptionLabel={(option) => option.name}
              />
            )}
          />
        </FormGroup>
      </Modal.Body>
      <Modal.Footer>
        <SubmitButton
          disabled={props.invalid}
          submitting={props.submitting}
          label={translate('Create')}
        />
      </Modal.Footer>
    </form>
  );
});
