import { FC, useEffect, useMemo, useRef } from 'react';
import { Field, Form, useForm, useFormState } from 'react-final-form';
import {
  adminArrowVendorOfferingMappingsCreate,
  adminArrowVendorOfferingMappingsPartialUpdate,
  ArrowVendorOfferingMapping,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { FormGroup, SubmitButton } from '@/form';
import { AsyncSelect as Select } from '@/form/select';
import { translate } from '@/i18n';
import { publicOfferingsAutocomplete } from '@/marketplace/common/autocompletes';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import {
  MappingFormData,
  PlanSelect,
  VendorNameSelect,
} from './SharedMappingFields';

interface VendorOfferingMappingDialogProps {
  resolve: {
    refetch: () => void;
    settings?: { uuid: string } | null;
    mapping?: ArrowVendorOfferingMapping;
  };
}

export const VendorOfferingMappingDialog: FC<
  VendorOfferingMappingDialogProps
> = ({ resolve }) => {
  const { mapping, settings } = resolve;
  const isEdit = Boolean(mapping);

  const initialValues = useMemo<MappingFormData>(
    () =>
      isEdit
        ? {
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
          }
        : undefined,
    [isEdit, mapping],
  );

  const loadOfferings = useMemo(() => publicOfferingsAutocomplete(), []);

  const submitMutation = useManagedMutation<any, any, MappingFormData>({
    mutationFn: (data) => {
      const vendorName =
        typeof data.arrow_vendor_name === 'string'
          ? data.arrow_vendor_name
          : data.arrow_vendor_name?.value || '';

      if (isEdit) {
        return adminArrowVendorOfferingMappingsPartialUpdate({
          path: { uuid: mapping.uuid },
          body: {
            arrow_vendor_name: vendorName,
            offering: data.offering.uuid,
            plan: data.plan?.uuid || null,
          },
        });
      } else {
        return adminArrowVendorOfferingMappingsCreate({
          body: {
            settings: settings?.uuid,
            arrow_vendor_name: vendorName,
            offering: data.offering.uuid,
            plan: data.plan?.uuid || '',
            is_active: true,
          },
        });
      }
    },
    successMessage: isEdit
      ? translate('Vendor offering mapping updated.')
      : translate('Vendor offering mapping created.'),
    errorMessage: isEdit
      ? translate('Unable to update vendor offering mapping.')
      : translate('Unable to create vendor offering mapping.'),
    refetch: resolve.refetch,
  });

  return (
    <Form<MappingFormData>
      onSubmit={(values) => submitMutation.mutateAsync(values)}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid, values }) => (
        <form onSubmit={handleSubmit}>
          <FormWatcher />
          <ModalDialog
            title={
              isEdit
                ? translate('Edit vendor offering mapping')
                : translate('Create vendor offering mapping')
            }
            footer={
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={isEdit ? translate('Save') : translate('Create')}
              />
            }
          >
            <div className="size-sm">
              <Field
                name="arrow_vendor_name"
                label={translate('Arrow vendor name')}
                description={translate(
                  'Select from existing Arrow vendors or type a new name',
                )}
                component={FormGroup}
                required
                validate={required}
              >
                <VendorNameSelect
                  settingsUuid={mapping?.settings_uuid || settings?.uuid}
                  defaultOption={initialValues?.arrow_vendor_name}
                />
              </Field>
              <Field
                name="offering"
                label={translate('Waldur offering')}
                component={FormGroup}
                required
                validate={required}
              >
                <Select
                  loadOptions={loadOfferings}
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.uuid}
                  defaultOptions={
                    initialValues?.offering ? [initialValues.offering] : []
                  }
                />
              </Field>
              <Field
                name="plan"
                label={translate('Plan')}
                description={translate(
                  'Billing plan to use for resources created from this vendor offering',
                )}
                component={FormGroup}
              >
                <PlanSelect offeringUuid={values.offering?.uuid} />
              </Field>
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};

const FormWatcher = () => {
  const { values } = useFormState({ subscription: { values: true } });
  const { change } = useForm();
  const prevOfferingRef = useRef(values.offering);

  useEffect(() => {
    if (values.offering !== prevOfferingRef.current) {
      change('plan', null);
      prevOfferingRef.current = values.offering;
    }
  }, [values.offering, change]);

  return null;
};
