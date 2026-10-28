import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { Field, useForm, useFormState } from 'react-final-form';

import { UI_STALE_TIME } from '@/core/constants';
import { required } from '@/core/validators';
import { SelectField } from '@/form';
import { translate } from '@/i18n';
import { getCategories } from '@/marketplace/common/api';
import { OfferingAutocomplete } from '@/marketplace/offerings/details/OfferingAutocomplete';
import { WizardForm, WizardFormStepProps } from '@/wizard';

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-5">
        <div className="lg:col-span-4 mb-5.5">
          <Field name="category_uuid">
            {({ input, meta }) => (
              <SelectField
                input={input}
                meta={meta}
                options={queryData.data}
                isClearable={true}
                getOptionValue={(option) => option.uuid}
                getOptionLabel={(option) => option.title}
                placeholder={translate('Select category...')}
                isLoading={queryData.isLoading}
                simpleValue
                noUpdateOnBlur
              />
            )}
          </Field>
        </div>
        <div className="lg:col-span-8">
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
        </div>
        {offering && (
          <div className="col-span-full">
            <p>
              <strong>{translate('Service provider')}: </strong>
              {offering.customer_name}
            </p>
          </div>
        )}
      </div>
    </WizardForm>
  );
};
