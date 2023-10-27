import { Modal } from 'react-bootstrap';
import { Field, reduxForm } from 'redux-form';

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
import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import {
  offeringsAutocomplete,
  providerAutocomplete,
} from '@waldur/marketplace/common/autocompletes';
import { CAMPAIGN_CREATE_FORM_ID } from '@waldur/marketplace/service-providers/constants';
import { CampaignFormData } from '@waldur/marketplace/service-providers/types';
import { StepIndicator } from '@waldur/notifications/StepIndicator';

interface OwnProps {
  submitting: boolean;
  formValues: CampaignFormData;
  step: number;
  setStep(step: number): void;
  initialValues?: any;
}

const enhance = reduxForm<CampaignFormData, OwnProps>({
  form: CAMPAIGN_CREATE_FORM_ID,
});

export const CampaignUpdateForm = enhance(({ submitting, step, setStep }) => (
  <>
    <StepIndicator
      steps={[translate('Select type'), translate('Actions')]}
      activeStep={step}
      onSelect={setStep}
    />
    <form>
      <Modal.Body className="scroll-y mx-5 mx-xl-15 my-7">
        {step === 0 ? (
          <FormContainer submitting={submitting} clearOnUnmount={false}>
            <StringField
              name="name"
              label={translate('Campaign name')}
              required
              validate={required}
            />
            <SelectField
              name="discount_type"
              label={translate('Discount type')}
              required
              simpleValue
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
              required
            />
            <DateField
              name="end_date"
              label={translate('Campaign end date')}
              required
            />
            <AsyncSelectField
              name="offerings"
              label={translate('Offerings')}
              placeholder={translate('Select offerings...')}
              loadOptions={(query, prevOptions, page) =>
                offeringsAutocomplete(
                  { name: query, shared: true },
                  prevOptions,
                  page,
                )
              }
              getOptionValue={(option) => option.uuid}
              getOptionLabel={(option) => option.name}
              isMulti
              required
            />
            <Field
              name="service_provider"
              label={translate('Service provider')}
              component={(fieldProps) => (
                <AsyncPaginate
                  placeholder={translate('Select provider...')}
                  loadOptions={providerAutocomplete}
                  defaultOptions
                  getOptionValue={(option) => option.customer_uuid}
                  getOptionLabel={(option) => option.customer_name}
                  value={fieldProps.input.value}
                  onChange={(value) => fieldProps.input.onChange(value)}
                  noOptionsMessage={() => translate('No providers')}
                  isClearable
                  additional={{
                    page: 1,
                  }}
                  required
                />
              )}
            />
          </FormContainer>
        ) : (
          <FormContainer submitting={submitting} clearOnUnmount={false}>
            <NumberField
              name="discount"
              label={translate('Discount')}
              required
              validate={required}
              min={0}
            />
            <NumberField name="stock" label={translate('Stock')} min={0} />
            <AwesomeCheckboxField
              name="auto_apply"
              label={translate('Auto apply')}
              hideLabel
            />
          </FormContainer>
        )}
      </Modal.Body>
    </form>
  </>
));
