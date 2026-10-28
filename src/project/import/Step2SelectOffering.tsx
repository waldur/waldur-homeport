import { FC, useMemo } from 'react';
import { Field, useForm, useFormState } from 'react-final-form';
import { Customer } from 'waldur-js-client';

import { FormField, FormLabel, FormText } from 'waldur-ui';

import { required } from '@/core/validators';
import { FieldError } from '@/form';
import { translate } from '@/i18n';
import {
  OfferingsAutocompleteCommonFields,
  publicOfferingsAutocomplete,
} from '@/marketplace/common/autocompletes';
import { AutocompleteField } from '@/marketplace/landing/AutocompleteField';

import { ProjectImportFormData } from './types';

interface Step2Props {
  context: {
    customer?: Customer;
  };
}

export const Step2SelectOffering: FC<Step2Props> = ({
  context: { customer },
}) => {
  const form = useForm<ProjectImportFormData>();
  const { values } = useFormState<ProjectImportFormData>();
  const importType = values?.import_type;
  const offering = values?.offering;

  const loadOfferings = useMemo(
    () =>
      publicOfferingsAutocomplete({
        ...(customer ? { allowed_customer_uuid: customer.uuid } : {}),
        field: OfferingsAutocompleteCommonFields.concat(
          'components',
          'attributes',
          'plans',
        ) as any,
      }),
    [customer],
  );

  return (
    <div>
      <FormField className="mb-5.5">
        <FormLabel>{translate('Select offering')}</FormLabel>
        <Field
          name="offering"
          validate={
            importType === 'projects_with_resources' ? required : undefined
          }
          render={({ input, meta }) => (
            <>
              <AutocompleteField
                placeholder={translate('Select offering...')}
                loadOfferings={loadOfferings}
                value={input.value}
                onChange={(value: any) => {
                  input.onChange(value);
                  if (value?.uuid !== offering?.uuid) {
                    form.change('file', null);
                  }
                }}
              />
              <FormText variant="muted">
                {translate(
                  'Select an offering type to generate the appropriate template with resource fields.',
                )}
              </FormText>
              {meta.touched && meta.error && <FieldError error={meta.error} />}
            </>
          )}
        />
      </FormField>
      {offering && (
        <div className="card card-bordered text-quaternary bg-secondary offering-components">
          <div className="card-body p-4">
            <p className="font-medium mb-0">
              {offering?.components?.length
                ? translate('This offering includes the following components:')
                : translate('The offering has no components!')}
            </p>
            {Boolean(offering?.components?.length) && (
              <ul className="mt-2.5 mb-0">
                {offering.components.map((component) => (
                  <li key={component.uuid || component.type}>
                    {component.name} ({component.type})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
