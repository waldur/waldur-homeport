import { Field, reduxForm } from 'redux-form';
import {
  marketplaceProviderOfferingsAddEndpoint,
  NestedEndpointRequest,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { StringField, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { FormGroup } from '../../FormGroup';

import { ENDPOINT_FORM_ID } from './constants';

export const AddEndpointDialog = reduxForm<
  {},
  { resolve: { offering; refetch } }
>({
  form: ENDPOINT_FORM_ID,
})((props) => {
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
    <form
      onSubmit={props.handleSubmit((values: NestedEndpointRequest) =>
        addMutation.mutateAsync(values),
      )}
    >
      <ModalDialog
        title={translate('Add endpoint')}
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
        <FormGroup label={translate('URL')} required={true}>
          <Field name="url" validate={required} component={StringField} />
        </FormGroup>
      </ModalDialog>
    </form>
  );
});
