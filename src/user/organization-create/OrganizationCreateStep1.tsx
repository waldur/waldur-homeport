import { CheckCircleIcon, InfoIcon, LockKeyIcon } from '@phosphor-icons/react';
import { FunctionComponent, useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { Field } from 'redux-form';

import { ENV } from '@waldur/core/config';
import { required } from '@waldur/core/validators';
import { DateField } from '@waldur/form/DateField';
import { FormGroup } from '@waldur/form/FormGroup';
import { StringField } from '@waldur/form/StringField';
import { WizardForm, WizardFormStepProps } from '@waldur/form/WizardForm';
import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';
import { useUser } from '@waldur/workspace/hooks';

import { getOnboardingCopy } from './constants';

export const OrganizationCreateStep1: FunctionComponent<WizardFormStepProps> = (
  props,
) => {
  const user = useUser();
  const [verified, setVerified] = useState(false);

  const countryCopy = getOnboardingCopy(
    ENV.plugins.WALDUR_CORE.ONBOARDING_COUNTRY,
  );

  // ToDo: remove this after implementing getting user's identifier via auth methods
  const isAustriaCountry = ENV.plugins.WALDUR_CORE.ONBOARDING_COUNTRY === 'AT';
  const needsPersonIdentifier = !user?.civil_number;
  const needsPersonalData =
    isAustriaCountry &&
    (!user?.first_name || !user?.last_name || !user?.birth_date);
  const showIdentifierForm = needsPersonIdentifier || needsPersonalData;

  // Initialize verified state based on user's civil_number or if form fields are present
  useEffect(() => {
    if (user?.civil_number || !showIdentifierForm) {
      setVerified(true);
    }
  }, [user?.civil_number, showIdentifierForm]);

  const handleVerify = () => {
    // TODO: Implement actual TARA auth integration
    // For now, simulate successful verification
    setVerified(true);
  };

  return (
    <WizardForm {...props}>
      <div className="d-flex flex-column gap-5">
        <Card className="card-bordered">
          <Card.Body>
            <h5 className="mb-3">{countryCopy.title}</h5>
            <p className="text-gray-700 mb-4">{countryCopy.description}</p>

            {!verified && (
              <>
                <Card className="card-bordered mb-4">
                  <Card.Body className="d-flex gap-3">
                    <div className="flex-shrink-0">
                      <InfoIcon size={24} weight="duotone" />
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-semibold text-gray-800 mb-1">
                        {translate('Why do we need this?')}
                      </div>
                      <div className="text-gray-700">{countryCopy.reason}</div>
                    </div>
                  </Card.Body>
                </Card>

                {/* ToDo: remove this workaround after implementing getting user's identifier via auth methods */}
                {showIdentifierForm ? (
                  <div className="mb-4">
                    <h6 className="mb-3">
                      {translate('Please provide your identification details')}
                    </h6>

                    {needsPersonalData ? (
                      <>
                        <Field
                          name="temp_first_name"
                          label={translate('First name')}
                          component={FormGroup}
                          required={true}
                          validate={required}
                        >
                          <StringField />
                        </Field>
                        <Field
                          name="temp_last_name"
                          label={translate('Last name')}
                          component={FormGroup}
                          required={true}
                          validate={required}
                        >
                          <StringField />
                        </Field>
                        <Field
                          name="temp_birth_date"
                          label={translate('Birth date')}
                          component={FormGroup}
                          required={true}
                          validate={required}
                        >
                          <DateField />
                        </Field>
                      </>
                    ) : needsPersonIdentifier ? (
                      <Field
                        name="temp_person_identifier"
                        label={translate('Person identifier')}
                        component={FormGroup}
                        required={true}
                        validate={required}
                        description={translate(
                          'Your personal identification number',
                        )}
                      >
                        <StringField />
                      </Field>
                    ) : null}
                  </div>
                ) : (
                  <>
                    <div className="d-flex justify-content-start mb-4">
                      <ActionButton
                        variant="primary"
                        action={handleVerify}
                        className="px-8"
                        iconNode={<LockKeyIcon size={20} weight="bold" />}
                        title={translate('Verify Identity with TARA')}
                      />
                    </div>

                    <p className="text-muted small mb-0">
                      {countryCopy.authMethodsNote}
                    </p>
                  </>
                )}
              </>
            )}
            {verified && (
              <Card className="card-bordered">
                <Card.Body className="d-flex gap-3">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon
                      size={24}
                      weight="duotone"
                      className="text-success"
                    />
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-semibold text-gray-800 mb-1">
                      {translate('Personal identity code received')}
                      {user?.civil_number && `: ${user.civil_number}`}
                    </div>
                    <div className="text-gray-700">
                      {translate(
                        'This will be used to check your company representative rights.',
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Card.Body>
        </Card>
      </div>
    </WizardForm>
  );
};
