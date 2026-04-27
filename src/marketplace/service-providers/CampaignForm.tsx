import { useSelector } from 'react-redux';
import { FormName } from 'redux-form';

import { ProgressStep } from '@/core/ProgressSteps';
import { required, requiredArray } from '@/core/validators';
import { FormContainer, NumberField, SelectField, StringField } from '@/form';
import { AsyncSelectField } from '@/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { DateField } from '@/form/DateField';
import { translate } from '@/i18n';
import { providerOfferingsAutocomplete } from '@/marketplace/common/autocompletes';
import { StepsList } from '@/marketplace/common/StepsList';
import { CampaignFormData } from '@/marketplace/service-providers/types';
import { getCustomer } from '@/workspace/selectors';

const steps: ProgressStep[] = [
  { key: 'type', label: translate('Select type'), completed: false },
  {
    key: 'actions',
    label: translate('Actions'),
    completed: false,
  },
];

export const CampaignForm = ({
  submitting,
  step,
  setStep,
  isNextDisabled,
}: {
  submitting: boolean;
  formValues: CampaignFormData;
  step: number;
  setStep(step: number): void;
  isNextDisabled?: boolean;
}) => {
  const customer = useSelector(getCustomer);
  return (
    <>
      <div className="mb-7">
        <StepsList
          steps={steps}
          value={steps[step]}
          onClick={(_, i) => (i > step && isNextDisabled ? null : setStep(i))}
        />
      </div>

      <FormName>
        {() =>
          step === 0 ? (
            <FormContainer
              submitting={submitting}
              clearOnUnmount={false}
              className="size-lg"
            >
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
                validate={required}
              />

              <DateField
                name="start_date"
                label={translate('Campaign start date')}
                required
                validate={required}
              />

              <DateField
                name="end_date"
                label={translate('Campaign end date')}
                required
                validate={required}
              />

              <AsyncSelectField
                name="offerings"
                label={translate('Offerings')}
                placeholder={translate('Select offerings...')}
                loadOptions={(query, prevOptions, page) =>
                  providerOfferingsAutocomplete(
                    { name: query, shared: true, customer: customer.url },
                    prevOptions,
                    page,
                  )
                }
                getOptionValue={(option) => option.uuid}
                getOptionLabel={(option) => option.name}
                isMulti
                required
                validate={requiredArray}
              />
            </FormContainer>
          ) : (
            <FormContainer
              submitting={submitting}
              clearOnUnmount={false}
              className="size-lg"
            >
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
          )
        }
      </FormName>
    </>
  );
};
