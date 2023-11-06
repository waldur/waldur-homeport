import { Modal } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { FormName } from 'redux-form';

import { required } from '@waldur/core/validators';
import {
  FormContainer,
  NumberField,
  SelectField,
  StringField,
} from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import { offeringsAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { CampaignFormData } from '@waldur/marketplace/service-providers/types';
import { StepIndicator } from '@waldur/notifications/StepIndicator';
import { getCustomer } from '@waldur/workspace/selectors';

export const CampaignForm = ({
  submitting,
  step,
  setStep,
}: {
  submitting: boolean;
  formValues: CampaignFormData;
  step: number;
  setStep(step: number): void;
}) => {
  const customer = useSelector(getCustomer);
  return (
    <>
      <StepIndicator
        steps={[translate('Select type'), translate('Actions')]}
        activeStep={step}
        onSelect={setStep}
      />
      <FormName>
        {() => (
          <Modal.Body className="scroll-y mx-5 mx-xl-15 my-7">
            {step === 0 ? (
              <FormContainer submitting={submitting} clearOnUnmount={false}>
                <StringField
                  name="name"
                  label={translate('Campaign name')}
                  required={true}
                  validate={required}
                />
                <SelectField
                  name="discount_type"
                  label={translate('Discount type')}
                  required={true}
                  simpleValue={true}
                  options={[
                    { label: translate('Discount'), value: 'discount' },
                    {
                      label: translate('Special price'),
                      value: 'special_price',
                    },
                  ]}
                />
                <DateField
                  name="start_date"
                  label={translate('Campaign start date')}
                  required={true}
                />
                <DateField
                  name="end_date"
                  label={translate('Campaign end date')}
                  required={true}
                />
                <AsyncSelectField
                  name="offerings"
                  label={translate('Offerings')}
                  placeholder={translate('Select offerings...')}
                  loadOptions={(query, prevOptions, page) =>
                    offeringsAutocomplete(
                      { name: query, shared: true, customer: customer.url },
                      prevOptions,
                      page,
                    )
                  }
                  getOptionValue={(option) => option.uuid}
                  getOptionLabel={(option) => option.name}
                  isMulti={true}
                  required={true}
                />
              </FormContainer>
            ) : (
              <FormContainer submitting={submitting} clearOnUnmount={false}>
                <NumberField
                  name="discount"
                  label={translate('Discount')}
                  required={true}
                  validate={required}
                  min={0}
                />
                <NumberField name="stock" label={translate('Stock')} min={0} />
                <AwesomeCheckboxField
                  name="auto_apply"
                  label={translate('Auto apply')}
                  hideLabel={true}
                />
              </FormContainer>
            )}
          </Modal.Body>
        )}
      </FormName>
    </>
  );
};
