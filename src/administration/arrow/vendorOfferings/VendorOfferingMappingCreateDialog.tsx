import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { change, reduxForm, Field } from 'redux-form';
import { adminArrowVendorOfferingMappingsCreate } from 'waldur-js-client';

import { required } from '@/core/validators';
import { FormContainer, SubmitButton } from '@/form';
import { AsyncSelectField } from '@/form/AsyncSelectField';
import { translate } from '@/i18n';
import { publicOfferingsAutocomplete } from '@/marketplace/common/autocompletes';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import {
  MappingFormData,
  PlanSelect,
  VendorNameSelect,
} from './SharedMappingFields';

const FORM_ID = 'VendorOfferingMappingCreateForm';

interface VendorOfferingMappingCreateDialogProps {
  resolve: {
    settings: { uuid: string } | null;
    refetch: () => void;
  };
}

export const VendorOfferingMappingCreateDialog = reduxForm<
  MappingFormData,
  VendorOfferingMappingCreateDialogProps
>({
  form: FORM_ID,
})(({ resolve, submitting, handleSubmit }) => {
  const dispatch = useDispatch();

  const [selectedOfferingUuid, setSelectedOfferingUuid] = useState<
    string | null
  >(null);

  const createMappingMutation = useManagedMutation<any, any, MappingFormData>({
    mutationFn: (data) => {
      // Handle both object (from dropdown) and string (from creatable)
      const vendorName =
        typeof data.arrow_vendor_name === 'string'
          ? data.arrow_vendor_name
          : data.arrow_vendor_name?.value || '';

      return adminArrowVendorOfferingMappingsCreate({
        body: {
          settings: resolve.settings?.uuid,
          arrow_vendor_name: vendorName,
          offering: data.offering.uuid,
          plan: data.plan?.uuid || '',
          is_active: true,
        },
      });
    },
    successMessage: translate('Vendor offering mapping created.'),
    errorMessage: translate('Unable to create vendor offering mapping.'),
    refetch: resolve.refetch,
  });

  const loadOfferings = useCallback(
    (query: string, prevOptions, page: number) =>
      publicOfferingsAutocomplete(query, prevOptions, page),
    [],
  );

  const handleOfferingChange = useCallback(
    (option: { uuid: string; name: string } | null) => {
      setSelectedOfferingUuid(option?.uuid || null);
      // Clear plan when offering changes
      dispatch(change(FORM_ID, 'plan', null));
    },
    [dispatch],
  );

  return (
    <form
      onSubmit={handleSubmit((values) =>
        createMappingMutation.mutateAsync(values),
      )}
    >
      <ModalDialog
        title={translate('Create vendor offering mapping')}
        footer={
          <SubmitButton
            disabled={submitting}
            submitting={submitting}
            label={translate('Create')}
          />
        }
      >
        <FormContainer submitting={submitting}>
          <Field
            name="arrow_vendor_name"
            label={translate('Arrow vendor name')}
            description={translate(
              'Select from existing Arrow vendors or type a new name',
            )}
            component={VendorNameSelect}
            settingsUuid={resolve.settings?.uuid}
            required
            validate={required}
          />
          <AsyncSelectField
            name="offering"
            label={translate('Waldur offering')}
            loadOptions={loadOfferings}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.uuid}
            required
            validate={required}
            onChange={handleOfferingChange}
          />
          <Field
            name="plan"
            label={translate('Plan')}
            description={translate(
              'Billing plan to use for resources created from this vendor offering',
            )}
            component={PlanSelect}
            offeringUuid={selectedOfferingUuid}
          />
        </FormContainer>
      </ModalDialog>
    </form>
  );
});
