import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Alert, Form as BsForm } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Field, getFormValues } from 'redux-form';
import { adminArrowVendorOfferingMappingsList } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { WizardForm, WizardFormStepProps } from '@/form/WizardForm';
import { translate } from '@/i18n';

const VendorOfferingSelect = ({
  input,
  settingsUuid,
}: {
  input: any;
  settingsUuid: string;
}) => {
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

export const Step2SelectVendorOffering: FC<WizardFormStepProps> = (props) => {
  const formValues = useSelector(getFormValues(props.form)) as {
    customerMapping?: { settings_uuid: string };
  };
  const settingsUuid = useMemo(
    () => formValues?.customerMapping?.settings_uuid,
    [formValues?.customerMapping?.settings_uuid],
  );

  return (
    <WizardForm {...props} submitDisabledInvalid>
      {() => (
        <div>
          <p className="text-muted mb-5">
            {translate(
              'Select the vendor offering to determine which Arrow licenses to show and which Waldur offering to import into.',
            )}
          </p>
          <Field
            name="vendorOffering"
            validate={required}
            component={({ input }) => (
              <VendorOfferingSelect input={input} settingsUuid={settingsUuid} />
            )}
          />
        </div>
      )}
    </WizardForm>
  );
};
