import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Alert, Form as BsForm } from 'react-bootstrap';
import { Field, useFormState } from 'react-final-form';
import { adminArrowVendorOfferingMappingsList } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { WizardFormStepProps } from '@/form/WizardForm';
import { WizardForm } from '@/form/WizardForm';
import { translate } from '@/i18n';

const VendorOfferingSelect = ({ input }: { input: any }) => {
  const formState = useFormState<{
    customerMapping: { settings_uuid: string };
  }>({ subscription: { values: true } });
  const settingsUuid = formState.values?.customerMapping?.settings_uuid;

  const { data, isLoading, error } = useQuery({
    queryKey: ['arrowVendorOfferings', settingsUuid],
    queryFn: async () => {
      const response = await adminArrowVendorOfferingMappingsList({
        query: { settings_uuid: settingsUuid, is_active: true },
      });
      return response.data || [];
    },
    enabled: Boolean(settingsUuid),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <Alert variant="danger">{translate('Failed to load offerings')}</Alert>
    );

  if (!data?.length) {
    return (
      <Alert variant="warning">
        {translate(
          'No vendor offerings are configured. Please configure vendor offering mappings first.',
        )}
      </Alert>
    );
  }

  return (
    <BsForm.Select
      value={input.value?.uuid || ''}
      onChange={(e) => {
        const selected = data?.find((item) => item.uuid === e.target.value);
        input.onChange(selected);
      }}
    >
      <option value="">{translate('Select vendor offering...')}</option>
      {data?.map((item) => (
        <option key={item.uuid} value={item.uuid}>
          {item.arrow_vendor_name} → {item.offering_name}
        </option>
      ))}
    </BsForm.Select>
  );
};

export const Step2SelectVendorOffering: FC<WizardFormStepProps> = (props) => (
  <WizardForm {...props}>
    <div>
      <p className="text-muted mb-5">
        {translate(
          'Select the vendor offering to determine which Arrow licenses to show and which Waldur offering to import into.',
        )}
      </p>
      <Field
        name="vendorOffering"
        validate={required}
        component={VendorOfferingSelect}
      />
    </div>
  </WizardForm>
);
