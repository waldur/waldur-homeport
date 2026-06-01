import { PlusCircleIcon } from '@phosphor-icons/react';
import { Form } from 'react-final-form';
import {
  organizationGroupsCreate,
  organizationGroupsUpdate,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { StringGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { SelectParentOrganizationGroup } from './SelectParentOrganizationGroup';

interface FormValues {
  name: string;
  parent?: { url: string; name: string };
}
export const OrganizationGroupForm = ({ resolve }) => {
  const isEdit = Boolean(resolve.organizationGroup?.uuid);
  const onSubmitMutation = useManagedMutation<any, any, FormValues>({
    mutationFn: (values) => {
      if (isEdit) {
        return organizationGroupsUpdate({
          path: { uuid: resolve.organizationGroup.uuid },
          body: {
            name: values.name,
            parent: values.parent?.url,
          },
        });
      } else {
        return organizationGroupsCreate({
          body: {
            name: values.name,
            parent: values.parent?.url,
          },
        });
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
    <Form<FormValues>
      onSubmit={(values) => onSubmitMutation.mutateAsync(values)}
      initialValues={
        resolve.organizationGroup
          ? {
              name: resolve.organizationGroup.name,
              parent: resolve.organizationGroup.parent
                ? {
                    url: resolve.organizationGroup.parent,
                    name: resolve.organizationGroup.parent_name,
                  }
                : undefined,
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
            footer={
              <SubmitButton
                disabled={invalid || submitting}
                submitting={submitting}
                label={isEdit ? translate('Edit') : translate('Create')}
              />
            }
          >
            <StringGroup
              name="name"
              label={translate('Name')}
              required
              validate={required}
            />
            <SelectParentOrganizationGroup
              currentOrganizationGroup={resolve.organizationGroup}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
