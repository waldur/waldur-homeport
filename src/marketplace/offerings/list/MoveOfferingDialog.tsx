import { FunctionComponent } from 'react';
import { Field, Form } from 'react-final-form';
import { marketplaceProviderOfferingsMoveOffering } from 'waldur-js-client';

import { required } from '@/core/validators';
import { FormFooter } from '@/form';
import { Select } from '@/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';

export const MoveOfferingDialog: FunctionComponent<{
  resolve: { offering; refetch };
}> = ({ resolve: { offering, refetch } }) => {
  const { showSuccess } = useNotify();

  const moveOfferingMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      marketplaceProviderOfferingsMoveOffering({
        path: { uuid: offering.uuid },
        body: {
          customer: formData.organization.url,
          preserve_permissions: formData.preserve_permissions,
        },
      }),
    errorMessage: translate('Offering could not be moved.'),
    refetch,
    onSuccess: (_data, variables) => {
      showSuccess(
        translate(
          '{offeringName} offering has been moved to {organizationName} organization.',
          {
            offeringName: offering.name,
            organizationName: variables.organization.name,
          },
        ),
      );
    },
  });

  return (
    <Form
      onSubmit={(values) => moveOfferingMutation.mutateAsync(values)}
      initialValues={{ preserve_permissions: false }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Move offering {offeringName}', {
              offeringName: offering.name,
            })}
            footer={
              <FormFooter
                submitting={submitting}
                invalid={invalid}
                submitLabel={translate('Save')}
              />
            }
          >
            <FormGroup label={translate('Move to service provider')} required>
              <Field
                component={Select as any}
                name="organization"
                validate={required}
                placeholder={translate('Select organization...')}
                loadOptions={(query, prevOptions, page) =>
                  organizationAutocomplete(query, prevOptions, page, {
                    field: ['name', 'url'],
                    o: 'name',
                    is_service_provider: true,
                  })
                }
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.url}
                noOptionsMessage={() => translate('No organizations')}
                isDisabled={submitting}
              />
            </FormGroup>
            <FormGroup>
              <Field
                component={AwesomeCheckboxField as any}
                name="preserve_permissions"
                label={translate('Preserve offering permissions')}
                description={translate(
                  'Keep existing offering permissions when moving to a new organization',
                )}
              />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    />
  );
};
