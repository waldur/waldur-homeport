import { FunctionComponent, useMemo } from 'react';
import { Form } from 'react-final-form';
import { marketplaceProviderOfferingsMoveOffering } from 'waldur-js-client';

import { required } from '@/core/validators';
import { FormFooter, BooleanGroup, AsyncSelectGroup } from '@/form';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';

export const MoveOfferingDialog: FunctionComponent<{
  resolve: { offering; refetch };
}> = ({ resolve: { offering, refetch } }) => {
  const { showSuccess } = useNotify();

  const loadOrganizations = useMemo(
    () =>
      organizationAutocomplete({
        field: ['name', 'url'],
        o: 'name',
        is_service_provider: true,
      }),
    [],
  );

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
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Move offering')}
            subtitle={
              <ScopeSubtitle
                label={translate('Offering name')}
                name={offering.name}
              />
            }
            footer={<FormFooter submitLabel={translate('Save')} />}
          >
            <AsyncSelectGroup
              name="organization"
              label={translate('Move to service provider')}
              required
              validate={required}
              placeholder={translate('Select organization...')}
              loadOptions={loadOrganizations}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.url}
              noOptionsMessage={() => translate('No organizations')}
              isDisabled={submitting}
            />
            <BooleanGroup
              name="preserve_permissions"
              label={translate('Preserve offering permissions')}
              description={translate(
                'Keep existing offering permissions when moving to a new organization',
              )}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
