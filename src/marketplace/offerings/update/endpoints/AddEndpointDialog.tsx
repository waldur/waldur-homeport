import { FC } from 'react';
import { Field, Form } from 'react-final-form';
import {
  marketplaceProviderOfferingsAddEndpoint,
  NestedEndpointRequest,
} from 'waldur-js-client';

import {
  composeValidators,
  required,
  url,
  validateMaxLength,
} from '@/core/validators';
import { FormGroup, StringField, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface AddEndpointDialogProps {
  resolve: {
    offering: any;
    refetch: () => void;
  };
}

export const AddEndpointDialog: FC<AddEndpointDialogProps> = (props) => {
  const addMutation = useManagedMutation<any, any, NestedEndpointRequest>({
    mutationFn: (formData) =>
      marketplaceProviderOfferingsAddEndpoint({
        path: { uuid: props.resolve.offering.uuid },
        body: formData,
      }),
    successMessage: translate('Endpoint has been added successfully.'),
    errorMessage: translate('Unable to add endpoint.'),
    refetch: props.resolve.refetch,
  });

  return (
    <Form<NestedEndpointRequest>
      onSubmit={(values) => addMutation.mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Add endpoint')}
            footer={
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={translate('Create')}
              />
            }
          >
            <Field
              name="name"
              validate={composeValidators(required, validateMaxLength(150))}
              component={FormGroup}
              label={translate('Name')}
              required={true}
            >
              <StringField />
            </Field>
            <Field
              name="url"
              validate={composeValidators(required, url)}
              component={FormGroup}
              label={translate('URL')}
              required={true}
            >
              <StringField />
            </Field>
          </ModalDialog>
        </form>
      )}
    />
  );
};
