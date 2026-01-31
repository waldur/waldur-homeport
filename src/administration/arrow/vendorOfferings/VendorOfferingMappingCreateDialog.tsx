import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import {
  adminArrowVendorOfferingMappingsCreate,
  adminArrowVendorOfferingMappingsVendorChoicesList,
} from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import { FormContainer, SubmitButton } from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { AsyncCreatablePaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { publicOfferingsAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

const FORM_ID = 'VendorOfferingMappingCreateForm';

interface VendorChoice {
  value: string;
  label: string;
}

interface FormData {
  arrow_vendor_name: VendorChoice | string;
  offering: { uuid: string; name: string };
}

interface VendorOfferingMappingCreateDialogProps {
  resolve: {
    settings: { uuid: string } | null;
    refetch: () => void;
  };
}

const VendorNameSelect = ({ input, settingsUuid }) => {
  const loadVendorChoices = useCallback(
    async (query: string, _prevOptions, { page }) => {
      try {
        const response =
          await adminArrowVendorOfferingMappingsVendorChoicesList({
            query: { settings_uuid: settingsUuid },
          });
        const options = (response.data || []).filter(
          (opt) =>
            !query || opt.label.toLowerCase().includes(query.toLowerCase()),
        );
        return {
          options,
          hasMore: false,
          additional: { page: page + 1 },
        };
      } catch {
        return { options: [], hasMore: false, additional: { page } };
      }
    },
    [settingsUuid],
  );

  return (
    <AsyncCreatablePaginate
      value={input.value}
      onChange={input.onChange}
      loadOptions={loadVendorChoices}
      getOptionLabel={(option: VendorChoice) => option.label}
      getOptionValue={(option: VendorChoice) => option.value}
      getNewOptionData={(inputValue: string) => ({
        value: inputValue,
        label: inputValue,
      })}
      formatCreateLabel={(inputValue: string) =>
        translate('Add "{value}"', { value: inputValue })
      }
      placeholder={translate('Select or type vendor name...')}
      defaultOptions
      additional={{ page: 1 }}
      classNamePrefix="metronic-select"
      className="metronic-select-container"
    />
  );
};

export const VendorOfferingMappingCreateDialog = reduxForm<
  FormData,
  VendorOfferingMappingCreateDialogProps
>({
  form: FORM_ID,
})(({ resolve, submitting, handleSubmit }) => {
  const dispatch = useDispatch();

  const { mutateAsync } = useMutation({
    mutationFn: (data: FormData) => {
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
          is_active: true,
        },
      });
    },
  });

  const loadOfferings = useCallback(
    (query: string, prevOptions, page: number) =>
      publicOfferingsAutocomplete(query, prevOptions, page),
    [],
  );

  const onSubmit = useCallback(
    async (formData: FormData) => {
      try {
        await mutateAsync(formData);
        dispatch(showSuccess(translate('Vendor offering mapping created.')));
        resolve.refetch();
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to create vendor offering mapping.'),
          ),
        );
      }
    },
    [dispatch, mutateAsync, resolve],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
          />
        </FormContainer>
      </ModalDialog>
    </form>
  );
});
