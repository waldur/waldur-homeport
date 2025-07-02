import { DateTime } from 'luxon';
import { Col, Modal, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { change, FormName, getFormValues } from 'redux-form';

import { required } from '@waldur/core/validators';
import { FormContainer, StringField, TextField } from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { DateField } from '@waldur/form/DateField';
import { WizardStepIndicator } from '@waldur/form/WizardStepIndicator';
import { translate } from '@waldur/i18n';
import {
  organizationAutocomplete,
  providerOfferingsAutocomplete,
} from '@waldur/marketplace/common/autocompletes';
import { RootState } from '@waldur/store/reducers';

import { templateAutocomplete } from './autocomplete';
import { BROADCAST_CREATE_FORM_ID } from './constants';
import { RecipientsList } from './RecipientsList';
import { BroadcastFormData, MessageTemplate } from './types';

const RecipientsListQuery = ({ form }) => {
  const query = useSelector(getFormValues(form));
  return <RecipientsList query={query} />;
};

export const BroadcastForm = ({
  submitting,
  step,
  setStep,
}: {
  submitting: boolean;
  step: number;
  setStep(step: number): void;
}) => {
  const dispatch = useDispatch();
  const formValues = useSelector<RootState, BroadcastFormData>(
    getFormValues(BROADCAST_CREATE_FORM_ID) as any,
  );

  return (
    <>
      <WizardStepIndicator
        steps={[translate('Create message'), translate('Select recipients')]}
        activeStep={step}
        onSelect={setStep}
      />

      <FormName>
        {({ form }) => (
          <Modal.Body className="scroll-y border-0">
            {step === 0 ? (
              <FormContainer submitting={submitting} clearOnUnmount={false}>
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

                <DateField
                  name="send_at"
                  label={translate('Send at')}
                  minDate={DateTime.now().plus({ days: 1 }).toISO()}
                />
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
                    <AwesomeCheckboxField
                      name="all_users"
                      label={translate('Send message to all users')}
                      hideLabel={true}
                    />

                    <AsyncSelectField
                      name="offerings"
                      label={translate('Offerings')}
                      placeholder={translate('Select offerings...')}
                      loadOptions={(query, prevOptions, page) =>
                        providerOfferingsAutocomplete(
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
                  <RecipientsListQuery form={form} />
                </Col>
              </Row>
            )}
          </Modal.Body>
        )}
      </FormName>
    </>
  );
};
