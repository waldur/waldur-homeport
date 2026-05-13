import { PlusCircleIcon } from '@phosphor-icons/react';
import { Field, Form } from 'react-final-form';
import {
  scienceSubDomainsCreate,
  scienceSubDomainsPartialUpdate,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { FormGroupFinal, SubmitButton } from '@/form';
import { StringField } from '@/form/StringField';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

export const ScienceSubDomainForm = ({ resolve }) => {
  const isEdit = Boolean(resolve.scienceSubDomain?.uuid);
  const onSubmitMutation = useManagedMutation<
    any,
    any,
    { name: string; code?: string }
  >({
    mutationFn: (values) =>
      isEdit
        ? scienceSubDomainsPartialUpdate({
            path: { uuid: resolve.scienceSubDomain.uuid },
            body: {
              name: values.name,
              code: values.code,
              domain: resolve.scienceSubDomain.domain,
            },
          })
        : scienceSubDomainsCreate({
            body: {
              name: values.name,
              code: values.code,
              domain: resolve.domainUrl,
            },
          }),
    successMessage: isEdit
      ? translate('The science sub-domain has been updated.')
      : translate('The science sub-domain has been created.'),
    errorMessage: isEdit
      ? translate('Unable to update science sub-domain.')
      : translate('Unable to create science sub-domain.'),
    refetch: resolve.refetch,
  });

  return (
    <Form
      onSubmit={(values: { name: string; code?: string }) =>
        onSubmitMutation.mutateAsync(values)
      }
      initialValues={
        resolve.scienceSubDomain
          ? {
              name: resolve.scienceSubDomain.name,
              code: resolve.scienceSubDomain.code,
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
                    name: resolve.scienceSubDomain.name,
                  })
                : translate('Create science sub-domain')
            }
            footer={
              <SubmitButton
                disabled={invalid || submitting}
                submitting={submitting}
                label={isEdit ? translate('Edit') : translate('Create')}
              />
            }
          >
            <Field
              name="code"
              component={FormGroupFinal}
              label={translate('Code')}
              description={translate('Auto-generated if left blank.')}
            >
              <StringField />
            </Field>
            <Field
              name="name"
              component={FormGroupFinal}
              label={translate('Name')}
              required
              validate={required}
            >
              <StringField />
            </Field>
          </ModalDialog>
        </form>
      )}
    />
  );
};
