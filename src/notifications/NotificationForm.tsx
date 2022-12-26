import { useState } from 'react';
import { Row, Col, Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { change, FormName } from 'redux-form';

import { required } from '@waldur/core/validators';
import { FormContainer, StringField, TextField } from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import {
  offeringsAutocomplete,
  organizationAutocomplete,
} from '@waldur/marketplace/common/autocompletes';

import { templateAutocomplete } from './autocomplete';
import { RecipientsList } from './RecipientsList';
import { StepIndicator } from './StepIndicator';
import { MessageTemplate, NotificationFormData } from './types';

export const NotificationForm = ({
  submitting,
  formValues,
}: {
  submitting: boolean;
  formValues: NotificationFormData;
}) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(0);
  return (
    <>
      <StepIndicator
        steps={[translate('Create message'), translate('Select recipients')]}
        activeStep={step}
        onSelect={setStep}
      />
      <FormName>
        {({ form }) => (
          <Modal.Body className="scroll-y mx-5 mx-xl-15 my-7">
            {step === 0 ? (
              <FormContainer submitting={submitting}>
                <AsyncSelectField
                  name="template"
                  label={translate('Template')}
                  placeholder={translate('Select template...')}
                  loadOptions={templateAutocomplete}
                  onChange={(_, newValue: MessageTemplate) => {
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
                      dispatch(change(form, 'subject', newValue.subject));
                      dispatch(change(form, 'body', newValue.body));
                    }
                  }}
                  isClearable={true}
                />
                <StringField
                  name="subject"
                  label={translate('Subject')}
                  required={true}
                  validate={required}
                />
                <TextField
                  name="body"
                  label={translate('Message')}
                  required={true}
                  validate={required}
                />
                <DateField name="send_at" label={translate('Send at')} />
              </FormContainer>
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
                  <FormContainer submitting={submitting}>
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
                      isMulti={true}
                    />
                    <AsyncSelectField
                      name="customers"
                      label={translate('Organizations')}
                      placeholder={translate('Select organizations...')}
                      loadOptions={(query, prevOptions, page) =>
                        organizationAutocomplete(query, prevOptions, page, {
                          field: ['name', 'uuid'],
                          o: 'name',
                        })
                      }
                      isMulti={true}
                    />
                  </FormContainer>
                </Col>
                <Col sm={7}>
                  <RecipientsList form={form} />
                </Col>
              </Row>
            )}
          </Modal.Body>
        )}
      </FormName>
    </>
  );
};
