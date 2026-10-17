import { pick } from 'lodash-es';
import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceProviderOfferingsAddEndpoint,
  marketplaceProviderOfferingsUpdateEndpoint,
  NestedEndpoint,
  NestedEndpointRequest,
} from 'waldur-js-client';

import {
  composeValidators,
  required,
  url,
  validateMaxLength,
} from '@/core/validators';
import { StringGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface EndpointFormDialogProps {
  resolve: {
    endpoint?: NestedEndpoint; // For edit mode
    offering: any;
    refetch: () => void;
  };
}

export const EndpointFormDialog: FC<EndpointFormDialogProps> = ({
  resolve,
}) => {
  const isEdit = Boolean(resolve.endpoint?.uuid);

  // Endpoints saved before URLs were validated may hold a URL the current rules
  // reject. Only check the URL when it changes, so such an endpoint can still
  // be renamed.
  const validateUrl = (value: string) =>
    isEdit && value === resolve.endpoint.url
      ? undefined
      : composeValidators(required, url)(value);

  const saveMutation = useManagedMutation<
    any,
    any,
    Partial<NestedEndpointRequest>
  >({
    mutationFn: (formData) =>
      isEdit
        ? marketplaceProviderOfferingsUpdateEndpoint({
            path: { uuid: resolve.offering.uuid },
            body: { uuid: resolve.endpoint.uuid, ...formData },
          })
        : marketplaceProviderOfferingsAddEndpoint({
            path: { uuid: resolve.offering.uuid },
            body: formData as NestedEndpointRequest,
          }),
    successMessage: isEdit
      ? translate('Endpoint has been updated successfully.')
      : translate('Endpoint has been added successfully.'),
    errorMessage: isEdit
      ? translate('Unable to update endpoint.')
      : translate('Unable to add endpoint.'),
    refetch: resolve.refetch,
  });

  return (
    <Form<NestedEndpointRequest>
      onSubmit={(values, form) =>
        saveMutation.mutateAsync(
          // In edit mode send only what changed: a resent URL would be checked
          // again against the allowed domains even when only the name changed.
          isEdit
            ? pick(values, Object.keys(form.getState().dirtyFields))
            : values,
        )
      }
      initialValues={
        isEdit
          ? { name: resolve.endpoint.name, url: resolve.endpoint.url }
          : undefined
      }
      render={({ handleSubmit, submitting, invalid, pristine }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit ? translate('Edit endpoint') : translate('Add endpoint')
            }
            footer={
              <SubmitButton
                disabled={invalid || (isEdit && pristine)}
                submitting={submitting}
                label={isEdit ? translate('Save') : translate('Create')}
              />
            }
          >
            <StringGroup
              name="name"
              validate={composeValidators(required, validateMaxLength(150))}
              label={translate('Name')}
              required={true}
            />
            <StringGroup
              name="url"
              validate={validateUrl}
              label={translate('URL')}
              required={true}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
