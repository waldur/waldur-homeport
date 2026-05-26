import { PlusCircleIcon } from '@phosphor-icons/react';
import arrayMutators from 'final-form-arrays';
import { FC } from 'react';
import { Form } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import {
  marketplaceProviderOfferingsUpdateIntegration,
  OfferingIntegrationUpdateRequest,
  ProviderOfferingDetails,
} from 'waldur-js-client';

import { IconButton } from '@/core/buttons/IconButton';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { EnvironmentVariablesList } from './EnvironmentVariablesList';

export interface EditVarsDialogProps {
  resolve: { offering: ProviderOfferingDetails; type?; refetch?(): void };
}

export const EditVarsDialog: FC<EditVarsDialogProps> = ({ resolve }) => {
  const updateMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      marketplaceProviderOfferingsUpdateIntegration({
        path: { uuid: resolve.offering.uuid },
        body: {
          secret_options: {
            ...resolve.offering.secret_options,
            environ: formData.environ,
          },
        } as OfferingIntegrationUpdateRequest,
      }),
    successMessage: translate(
      'Environment variables have been updated successfully.',
    ),
    errorMessage: translate('Unable to update environment variables.'),
    refetch: resolve.refetch,
  });

  return (
    <Form
      onSubmit={(values) => updateMutation.mutateAsync(values)}
      initialValues={{
        environ: resolve.offering.secret_options.environ,
      }}
      mutators={{ ...arrayMutators }}
      render={({ handleSubmit, invalid, submitting }) => (
        <form onSubmit={handleSubmit}>
          <FieldArray name="environ">
            {(nestedProps) => (
              <ModalDialog
                title={translate('Edit environment variables')}
                actions={
                  <IconButton
                    iconNode={<PlusCircleIcon weight="bold" />}
                    tooltip={translate('Add variable')}
                    onClick={() => nestedProps.fields.push({})}
                  />
                }
                footer={
                  <>
                    <CloseDialogButton />
                    <SubmitButton
                      disabled={invalid}
                      submitting={submitting}
                      label={translate('Save')}
                    />
                  </>
                }
              >
                <EnvironmentVariablesList fields={nestedProps.fields} />
              </ModalDialog>
            )}
          </FieldArray>
        </form>
      )}
    />
  );
};
