import { PlusCircleIcon } from '@phosphor-icons/react';
import { Form } from 'react-final-form';
import {
  ScienceDomainRequest,
  scienceDomainsCreate,
  scienceDomainsPartialUpdate,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { SubmitButton, StringGroup } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

export const ScienceDomainForm = ({ resolve }) => {
  const isEdit = Boolean(resolve.scienceDomain?.uuid);

  const onSubmitMutation = useManagedMutation<any, any, ScienceDomainRequest>({
    mutationFn: (values) =>
      isEdit
        ? scienceDomainsPartialUpdate({
            path: { uuid: resolve.scienceDomain.uuid },
            body: values,
          })
        : scienceDomainsCreate({ body: values }),
    successMessage: isEdit
      ? translate('The science domain has been updated.')
      : translate('The science domain has been created.'),
    errorMessage: isEdit
      ? translate('Unable to update science domain.')
      : translate('Unable to create science domain.'),
    refetch: resolve.refetch,
  });

  return (
    <Form<ScienceDomainRequest>
      onSubmit={(values) => onSubmitMutation.mutateAsync(values)}
      initialValues={
        resolve.scienceDomain
          ? {
              name: resolve.scienceDomain.name,
              code: resolve.scienceDomain.code,
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
                    name: resolve.scienceDomain.name,
                  })
                : translate('Create science domain')
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
              name="code"
              label={translate('Code')}
              description={translate('Auto-generated if left blank.')}
            />
            <StringGroup
              name="name"
              label={translate('Name')}
              required
              validate={required}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
