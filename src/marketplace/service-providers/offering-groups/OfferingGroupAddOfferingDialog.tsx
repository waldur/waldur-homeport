import { useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceProviderOfferingsSetOfferingGroup,
  OfferingGroup,
  ProviderOffering,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { AsyncSelectGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { providerOfferingsAutocomplete } from '@/marketplace/common/autocompletes';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { isOfferingGroupOfferingsQuery } from './constants';

interface OfferingGroupAddOfferingDialogProps {
  resolve: {
    group: OfferingGroup;
    refetch: () => void;
  };
}

interface FormValues {
  offering: ProviderOffering | null;
}

// Adds an offering to the group from the group's side. An offering can only
// join a group of its own organization, so the picker is limited to those.
export const OfferingGroupAddOfferingDialog = ({
  resolve,
}: OfferingGroupAddOfferingDialogProps) => {
  const loadOfferings = useMemo(
    () =>
      providerOfferingsAutocomplete({
        customer_uuid: resolve.group.customer_uuid,
        state: ['Draft', 'Active', 'Paused'],
      }),
    [resolve.group.customer_uuid],
  );

  const mutation = useManagedMutation<any, any, FormValues>({
    mutationFn: (values) =>
      marketplaceProviderOfferingsSetOfferingGroup({
        path: { uuid: values.offering!.uuid! },
        body: { offering_group: resolve.group.uuid },
      }),
    successMessage: translate('Offering has been added to the group.'),
    errorMessage: translate('Unable to add the offering to the group.'),
    refetch: resolve.refetch,
    invalidateQueries: [{ predicate: isOfferingGroupOfferingsQuery }],
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await mutation.mutateAsync(values);
    } catch (e: any) {
      if (e?.response?.status === 400) {
        return e.response.data;
      }
    }
  };

  return (
    <Form<FormValues>
      onSubmit={onSubmit}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Add offering')}
            subtitle={
              <ScopeSubtitle
                label={translate('Offering group')}
                name={resolve.group.title}
              />
            }
            footer={
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={translate('Add')}
              />
            }
          >
            <div className="size-sm">
              <AsyncSelectGroup
                name="offering"
                label={translate('Offering')}
                description={translate(
                  'Offerings of {organization}. An offering already in another group moves to this one.',
                  { organization: resolve.group.customer_name },
                )}
                validate={required}
                required
                placeholder={translate('Select offering...')}
                loadOptions={loadOfferings}
                getOptionValue={(option) => option.uuid}
                getOptionLabel={(option) => option.name}
                noOptionsMessage={() => translate('No offerings')}
                disabled={submitting}
              />
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
