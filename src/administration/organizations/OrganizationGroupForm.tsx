import { PlusCircleIcon } from '@phosphor-icons/react';
import { Field, Form } from 'react-final-form';
import {
  organizationGroupsCreate,
  organizationGroupsUpdate,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { FormGroup, SubmitButton } from '@/form';
import { StringField } from '@/form/StringField';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { SelectOrganizationGroupField } from './SelectOrganizationGroupField';

export const OrganizationGroupForm = ({ resolve }) => {
  const isEdit = Boolean(resolve.organizationGroup?.uuid);
  const onSubmitMutation = useManagedMutation<any, any, any>({
    mutationFn: (values) => {
      values['parent'] = values['parent']?.url;
      if (isEdit) {
        return organizationGroupsUpdate({
          path: { uuid: resolve.organizationGroup.uuid },
          body: values,
        });
      } else {
        return organizationGroupsCreate({ body: values });
      }
    },
    successMessage: isEdit
      ? translate('The organization group has been updated.')
      : translate('The organization group has been created.'),
    errorMessage: isEdit
      ? translate('Unable to update organization group.')
      : translate('Unable to create organization group.'),
    refetch: resolve.refetch,
  });

  return (
    <Form
      onSubmit={(values) => onSubmitMutation.mutateAsync(values)}
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
