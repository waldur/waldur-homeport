import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { Col } from 'react-bootstrap';
import { Field, useForm, useFormState } from 'react-final-form';

import { UI_STALE_TIME } from '@/core/constants';
import { required } from '@/core/validators';
import { SelectField } from '@/form';
import { WizardFormStepProps } from '@/form/WizardForm';
import { WizardForm } from '@/form/WizardForm';
import { translate } from '@/i18n';
import { getCategories } from '@/marketplace/common/api';
import { OfferingAutocomplete } from '@/marketplace/offerings/details/OfferingAutocomplete';

export const WizardFormFirstPage: FunctionComponent<WizardFormStepProps> = (
  props,
) => {
  const queryData = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: UI_STALE_TIME,
  });
  const { values } = useFormState({
    subscription: { values: true },
  });
  const form = useForm();
  const { category_uuid, offering } = values || {};

  return (
    <WizardForm {...props}>
      <div className="size-lg row">
        <Col lg={4} className="mb-7">
          <Field
            name="category_uuid"
            options={queryData.data}
            isClearable={true}
            component={SelectField as any}
            getOptionValue={(option) => option.uuid}
            getOptionLabel={(option) => option.title}
            placeholder={translate('Select category...')}
            isLoading={queryData.isLoading}
            simpleValue
            noUpdateOnBlur
          />
        </Col>
        <Col lg={8}>
          <OfferingAutocomplete
            offeringFilter={{
              category_uuid,
              allowed_customer_uuid: props.data.call.customer_uuid,
            }}
            validate={required}
            providerOfferings={false}
            onChange={(value) => {
              if (value?.uuid !== offering?.uuid) {
                form.change('plan', undefined);
              }
            }}
          />
        </Col>
        {offering && (
          <Col sx={12}>
            <p>
              <strong>{translate('Service provider')}: </strong>
              {offering.customer_name}
            </p>
          </Col>
        )}
      </div>
    </WizardForm>
  );
};
