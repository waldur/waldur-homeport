import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { change, reduxForm, Field } from 'redux-form';
import {
  adminArrowVendorOfferingMappingsPartialUpdate,
  ArrowVendorOfferingMapping,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { FormContainer, SubmitButton } from '@/form';
import { AsyncSelectField } from '@/form/AsyncSelectField';
import { translate } from '@/i18n';
import { publicOfferingsAutocomplete } from '@/marketplace/common/autocompletes';
import { closeModalDialog } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@/store/notify';

import {
  MappingFormData,
  PlanSelect,
  VendorNameSelect,
} from './SharedMappingFields';

const FORM_ID = 'VendorOfferingMappingEditForm';

interface VendorOfferingMappingEditDialogProps {
  resolve: {
    mapping: ArrowVendorOfferingMapping;
    refetch: () => void;
  };
  initialValues?: MappingFormData;
}

const PureVendorOfferingMappingEditDialog = reduxForm<
  MappingFormData,
  VendorOfferingMappingEditDialogProps
>({
  form: FORM_ID,
  enableReinitialize: true,
})(({ resolve, submitting, handleSubmit, initialValues }) => {
  const dispatch = useDispatch();
  const [selectedOfferingUuid, setSelectedOfferingUuid] = useState<
    string | null
  >(resolve.mapping.offering_uuid || null);

  const { mutateAsync } = useMutation({
    mutationFn: (data: MappingFormData) => {
      // Handle both object (from dropdown) and string (from creatable)
      const vendorName =
        typeof data.arrow_vendor_name === 'string'
          ? data.arrow_vendor_name
          : data.arrow_vendor_name?.value || '';

      return adminArrowVendorOfferingMappingsPartialUpdate({
        path: { uuid: resolve.mapping.uuid },
        body: {
          arrow_vendor_name: vendorName,
          offering: data.offering.uuid,
          plan: data.plan?.uuid || null,
        },
      });
    },
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

  const onSubmit = useCallback(
    async (formData: MappingFormData) => {
      try {
        await mutateAsync(formData);
        dispatch(showSuccess(translate('Vendor offering mapping updated.')));
        resolve.refetch();
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to update vendor offering mapping.'),
          ),
        );
      }
    },
    [dispatch, mutateAsync, resolve],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ModalDialog
        title={translate('Edit vendor offering mapping')}
        footer={
          <SubmitButton
            disabled={submitting}
            submitting={submitting}
            label={translate('Save')}
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
            settingsUuid={resolve.mapping.settings_uuid}
            defaultOption={initialValues?.arrow_vendor_name}
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
            defaultOptions={
              initialValues?.offering ? [initialValues.offering] : []
            }
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

// Wrapper that provides initial values from mapping
export const VendorOfferingMappingEditDialogWrapper = (
  props: Omit<VendorOfferingMappingEditDialogProps, 'initialValues'>,
) => {
  const { mapping } = props.resolve;
  const initialValues: MappingFormData = {
    arrow_vendor_name: {
      value: mapping.arrow_vendor_name,
      label: mapping.arrow_vendor_name,
    },
    offering: {
      uuid: mapping.offering_uuid,
      name: mapping.offering_name,
    },
    plan:
      mapping.plan_uuid && mapping.plan_name
        ? { uuid: mapping.plan_uuid, name: mapping.plan_name }
        : null,
  };

  return (
    <PureVendorOfferingMappingEditDialog
      {...props}
      initialValues={initialValues}
    />
  );
};
