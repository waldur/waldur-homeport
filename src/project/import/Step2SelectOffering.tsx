import { FC, useEffect } from 'react';
import { Card, Form } from 'react-bootstrap';

import { required } from '@waldur/core/validators';
import { FormContainer } from '@waldur/form';
import { WizardForm, WizardFormStepProps } from '@waldur/form/WizardForm';
import { translate } from '@waldur/i18n';
import { OfferingsAutocompleteCommonFields } from '@waldur/marketplace/common/autocompletes';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';

export const Step2SelectOffering: FC<WizardFormStepProps> = (props) => {
  return (
    <WizardForm {...props}>
      {(wizardProps) => {
        const importType = wizardProps.formValues?.import_type;
        const offering = wizardProps.formValues?.offering;

        // Skip this step if the import type is only to import projects
        useEffect(() => {
          if (importType === 'projects_only') {
            wizardProps.handleSubmit(props.onSubmit)();
          }
        }, []);

        return (
          <FormContainer
            submitting={false}
            clearOnUnmount={false}
            className="size-lg"
          >
            <Form.Group className="mb-7">
              <Form.Label>{translate('Select offering')}</Form.Label>
              <OfferingAutocomplete
                offeringFilter={
                  props.data?.customer
                    ? { allowed_customer_uuid: props.data.customer.uuid }
                    : undefined
                }
                onChange={(value) => {
                  // Reset file when offering changes
                  if (value.uuid !== offering?.uuid) {
                    wizardProps.change('file', null);
                  }
                }}
                providerOfferings={false}
                validate={
                  importType === 'projects_with_resources'
                    ? required
                    : undefined
                }
                showError
                description={translate(
                  'Select an offering type to generate the appropriate template with resource fields.',
                )}
                field={OfferingsAutocompleteCommonFields.concat(
                  'components',
                  'attributes',
                )}
              />
            </Form.Group>
            {offering && (
              <Card className="card-bordered text-muted bg-gray-50 offering-components">
                <Card.Body className="p-5">
                  <p className="fw-bold mb-0">
                    {offering?.components?.length
                      ? translate(
                          'This offering includes the following components:',
                        )
                      : translate('The offering has no components!')}
                  </p>
                  {!!offering?.components?.length && (
                    <ul className="mt-3 mb-0">
                      {offering.components.map((component) => (
                        <li key={component.uuid}>
                          {component.name} ({component.type})
                        </li>
                      ))}
                    </ul>
                  )}
                </Card.Body>
              </Card>
            )}
          </FormContainer>
        );
      }}
    </WizardForm>
  );
};
