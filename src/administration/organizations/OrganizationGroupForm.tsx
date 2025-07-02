import { PlusCircleIcon } from '@phosphor-icons/react';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  organizationGroupsCreate,
  organizationGroupsUpdate,
} from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import { FormGroup, SubmitButton } from '@waldur/form';
import { StringField } from '@waldur/form/StringField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { SelectOrganizationGroupField } from './SelectOrganizationGroupField';

interface FormData {
  name: string;
}

export const OrganizationGroupForm = ({ resolve }) => {
  const isEdit = Boolean(resolve.organizationGroup?.uuid);
  const dispatch = useDispatch();

  const onSubmit = async (values: FormData) => {
    values['parent'] = values['parent']?.url;
    try {
      if (isEdit) {
        await organizationGroupsUpdate({
          path: { uuid: resolve.organizationGroup.uuid },
          body: values,
        });
      } else {
        await organizationGroupsCreate({ body: values });
      }
      resolve.refetch();
      dispatch(
        showSuccess(
          isEdit
            ? translate('The organization group has been updated.')
            : translate('The organization group has been created.'),
        ),
      );
      dispatch(closeModalDialog());
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          isEdit
            ? translate('Unable to update organization group.')
            : translate('Unable to create organization group.'),
        ),
      );
    }
  };

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={
        resolve.organizationGroup
          ? {
              name: resolve.organizationGroup.name,
              parent: resolve.organizationGroup.parent,
            }
          : undefined
      }
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            iconNode={isEdit ? null : <PlusCircleIcon weight="bold" />}
            iconColor="success"
            title={
              isEdit
                ? translate('Edit {name}', {
                    name: resolve.organizationGroup.name,
                  })
                : translate('Create organization group')
            }
            closeButton
            footer={
              <SubmitButton
                disabled={invalid || submitting}
                submitting={submitting}
                label={isEdit ? translate('Edit') : translate('Create')}
              />
            }
          >
            <Field
              name="name"
              component={FormGroup as any}
              label={translate('Name')}
              required
              validate={required}
            >
              <StringField />
            </Field>
            <Field
              name="parent"
              component={FormGroup as any}
              label={translate('Parent group')}
            >
              <SelectOrganizationGroupField
                currentOrganizationGroup={resolve.organizationGroup}
              />
            </Field>
          </ModalDialog>
        </form>
      )}
    />
  );
};
