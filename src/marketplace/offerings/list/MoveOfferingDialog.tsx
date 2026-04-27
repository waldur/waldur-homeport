import { FunctionComponent, useCallback } from 'react';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { marketplaceProviderOfferingsMoveOffering } from 'waldur-js-client';

import { format } from '@/core/ErrorMessageFormatter';
import { required } from '@/core/validators';
import { FormFooter } from '@/form';
import { Select } from '@/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { closeModalDialog } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { showError, showSuccess } from '@/store/notify';

export const MoveOfferingDialog: FunctionComponent<{
  resolve: { offering; refetch };
}> = ({ resolve: { offering, refetch } }) => {
  const dispatch = useDispatch();
  const onSubmit = useCallback(
    async (formData) => {
      try {
        await marketplaceProviderOfferingsMoveOffering({
          path: { uuid: offering.uuid },
          body: {
            customer: formData.organization.url,
            preserve_permissions: formData.preserve_permissions,
          },
        });
        dispatch(
          showSuccess(
            translate(
              '{offeringName} offering has been moved to {organizationName} organization.',
              {
                offeringName: offering.name,
                organizationName: formData.organization.name,
              },
            ),
          ),
        );
        await refetch();
        dispatch(closeModalDialog());
      } catch (error) {
        const errorMessage = `${translate('Offering could not be moved.')} ${format(error)}`;
        dispatch(showError(errorMessage));
      }
    },
    [dispatch, offering],
  );

  return (
    <Form
      onSubmit={onSubmit}
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
