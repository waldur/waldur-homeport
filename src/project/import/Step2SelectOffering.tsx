import { FC, useMemo } from 'react';
import { Card, Form } from 'react-bootstrap';
import { Field, useForm, useFormState } from 'react-final-form';
import { Customer } from 'waldur-js-client';

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
        ),
      }),
    [customer],
  );

  return (
    <div className="size-lg">
      <Form.Group className="mb-7">
        <Form.Label>{translate('Select offering')}</Form.Label>
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
              <Form.Text className="text-muted">
                {translate(
                  'Select an offering type to generate the appropriate template with resource fields.',
                )}
              </Form.Text>
              {meta.touched && meta.error && <FieldError error={meta.error} />}
            </>
          )}
        />
      </Form.Group>
      {offering && (
        <Card className="card-bordered text-muted bg-gray-50 offering-components">
          <Card.Body className="p-5">
            <p className="fw-bold mb-0">
              {offering?.components?.length
                ? translate('This offering includes the following components:')
                : translate('The offering has no components!')}
            </p>
            {Boolean(offering?.components?.length) && (
              <ul className="mt-3 mb-0">
                {offering.components.map((component) => (
                  <li key={component.uuid || component.type}>
                    {component.name} ({component.type})
                  </li>
                ))}
              </ul>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
};
