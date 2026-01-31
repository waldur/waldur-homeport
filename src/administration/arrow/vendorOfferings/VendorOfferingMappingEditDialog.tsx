import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import {
  adminArrowVendorOfferingMappingsPartialUpdate,
  adminArrowVendorOfferingMappingsVendorChoicesList,
  ArrowVendorOfferingMapping,
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

const FORM_ID = 'VendorOfferingMappingEditForm';

interface VendorChoice {
  value: string;
  label: string;
}

interface FormData {
  arrow_vendor_name: VendorChoice | string;
  offering: { uuid: string; name: string };
}

interface VendorOfferingMappingEditDialogProps {
  resolve: {
    mapping: ArrowVendorOfferingMapping;
    refetch: () => void;
  };
  initialValues?: FormData;
}

const VendorNameSelect = ({ input, settingsUuid, defaultOption }) => {
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
      defaultOptions={defaultOption ? [defaultOption] : true}
      additional={{ page: 1 }}
      classNamePrefix="metronic-select"
      className="metronic-select-container"
    />
  );
};

const PureVendorOfferingMappingEditDialog = reduxForm<
  FormData,
  VendorOfferingMappingEditDialogProps
>({
  form: FORM_ID,
  enableReinitialize: true,
})(({ resolve, submitting, handleSubmit, initialValues }) => {
  const dispatch = useDispatch();

  const { mutateAsync } = useMutation({
    mutationFn: (data: FormData) => {
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
  const initialValues: FormData = {
    arrow_vendor_name: {
      value: mapping.arrow_vendor_name,
      label: mapping.arrow_vendor_name,
    },
    offering: {
      uuid: mapping.offering_uuid,
      name: mapping.offering_name,
    },
  };

  return (
    <PureVendorOfferingMappingEditDialog
      {...props}
      initialValues={initialValues}
    />
  );
};
