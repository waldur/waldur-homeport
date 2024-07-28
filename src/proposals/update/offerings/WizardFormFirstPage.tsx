import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { Col } from 'react-bootstrap';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { FormContainer, SelectField } from '@waldur/form';
import { WizardForm, WizardFormStepProps } from '@waldur/form/WizardForm';
import { translate } from '@waldur/i18n';
import { getCategories } from '@waldur/marketplace/common/api';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';

export const WizardFormFirstPage: FunctionComponent<WizardFormStepProps> = (
  props,
) => {
  const queryData = useQuery(['categories'], getCategories, {
    staleTime: 3 * 60 * 1000,
  });

  return (
    <WizardForm {...props}>
      {(wizardProps) => {
        const { category_uuid, offering } = wizardProps.formValues;
        return (
          <FormContainer
            submitting={wizardProps.submitting}
            clearOnUnmount={false}
            className="size-lg row"
          >
            <Col lg={4} className="mb-7">
              <Field
                name="category_uuid"
                options={queryData.data}
                isClearable={true}
                component={SelectField}
                getOptionValue={(option) => option.uuid}
                getOptionLabel={(option) => option.title}
                placeholder={translate('Select category') + '...'}
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
                    wizardProps.change('plan', undefined);
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
          </FormContainer>
        );
      }}
    </WizardForm>
  );
};
