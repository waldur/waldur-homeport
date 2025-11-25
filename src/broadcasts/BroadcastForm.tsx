import { DateTime } from 'luxon';
import { Col, Row } from 'react-bootstrap';
import { Field, useForm, useFormState } from 'react-final-form';

import { ProgressStep } from '@waldur/core/ProgressSteps';
import { required } from '@waldur/core/validators';
import { Select } from '@waldur/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { DateField } from '@waldur/form/DateField';
import { StringField } from '@waldur/form/StringField';
import { TextField } from '@waldur/form/TextField';
import { translate } from '@waldur/i18n';
import {
  organizationAutocomplete,
  providerOfferingsAutocomplete,
} from '@waldur/marketplace/common/autocompletes';
import { StepsList } from '@waldur/marketplace/common/StepsList';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { templateAutocomplete } from './autocomplete';
import { RecipientsList } from './RecipientsList';
import { MessageTemplate } from './types';

const steps: ProgressStep[] = [
  { key: 'message', label: translate('Create message'), completed: false },
  {
    key: 'recipients',
    label: translate('Select recipients'),
    completed: false,
  },
];

const RecipientsListQuery = () => {
  const { values } = useFormState();
  return <RecipientsList query={values} />;
};

export const BroadcastForm = ({
  step,
  setStep,
  isNextDisabled,
}: {
  step: number;
  setStep(step: number): void;
  isNextDisabled: boolean;
}) => {
  const { values: formValues } = useFormState();
  const form = useForm();

  return (
    <>
      <StepsList
        steps={steps}
        value={steps[step]}
        onClick={(_, i) => (i > step && isNextDisabled ? null : setStep(i))}
      />

      {step === 0 ? (
        <div>
          <FormGroup
            label={translate('Template')}
            help={translate('Select a pre-defined template')}
          >
            <Field
              name="template"
              component={Select as any}
              placeholder={translate('Select template...')}
              loadOptions={templateAutocomplete}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.uuid}
              noOptionsMessage={() => translate('No templates found')}
              onChange={(newValue: MessageTemplate) => {
                if (newValue) {
                  if (
                    formValues &&
                    ((formValues.subject &&
                      formValues.subject != newValue.subject) ||
                      (formValues.body && formValues.body != newValue.body))
                  ) {
                    const response = confirm(
                      'Form is not empty. Selecting template would replace existing message. Are you sure?',
                    );
                    if (!response) {
                      return;
                    }
                  }
                  form.change('subject', newValue.subject);
                  form.change('body', newValue.body);
                }
              }}
              isClearable={true}
            />
          </FormGroup>

          <FormGroup label={translate('Subject')} required>
            <Field
              name="subject"
              component={StringField as any}
              validate={required}
            />
          </FormGroup>

          <FormGroup label={translate('Message')} required>
            <Field
              name="body"
              component={TextField as any}
              validate={required}
            />
          </FormGroup>

          <FormGroup
            label={translate('Send at')}
            help={translate(
              'Schedule the message to be sent at a specific time',
            )}
          >
            <Field
              name="send_at"
              component={DateField as any}
              minDate={DateTime.now().plus({ days: 1 }).toISO()}
            />
          </FormGroup>
        </div>
      ) : (
        <Row>
          <Col
            sm={4}
            style={{
              borderRight: '2px solid #eff2f5',
              paddingRight: 20,
              marginRight: 20,
            }}
          >
            <FormGroup>
              <Field
                name="all_users"
                component={AwesomeCheckboxField as any}
                label={translate('Send message to all users')}
                hideLabel={true}
              />
            </FormGroup>

            <FormGroup
              label={translate('Offerings')}
              help={translate('Select specific offerings to target')}
            >
              <Field
                name="offerings"
                component={Select as any}
                placeholder={translate('Select offerings...')}
                loadOptions={(query, prevOptions, page) =>
                  providerOfferingsAutocomplete(
                    { name: query, shared: true },
                    prevOptions,
                    page,
                  )
                }
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.uuid}
                noOptionsMessage={() => translate('No offerings found')}
                isMulti={true}
              />
            </FormGroup>

            <FormGroup
              label={translate('Organizations')}
              help={translate('Select specific organizations to target')}
            >
              <Field
                name="customers"
                component={Select as any}
                placeholder={translate('Select organizations...')}
                loadOptions={(query, prevOptions, page) =>
                  organizationAutocomplete(query, prevOptions, page, {
                    field: ['name', 'uuid'],
                    o: 'name',
                  })
                }
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.uuid}
                noOptionsMessage={() => translate('No organizations found')}
                isMulti={true}
              />
            </FormGroup>
          </Col>
          <Col sm={7}>
            <RecipientsListQuery />
          </Col>
        </Row>
      )}
    </>
  );
};
