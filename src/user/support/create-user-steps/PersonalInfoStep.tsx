import { FC } from 'react';
import { Field } from 'react-final-form';

import { StringField } from '@/form/StringField';
import { TextField } from '@/form/TextField';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { isProfileAttributeEnabled } from '@/user/support/profileAttributes';
import { WizardModal, WizardStepProps } from '@/wizard';

export const PersonalInfoStep: FC<WizardStepProps> = (props) => {
  return (
    <WizardModal {...props}>
      <div className="row">
        <div className="col-sm-6">
          <FormGroup label={translate('First name')}>
            <Field name="first_name" component={StringField} />
          </FormGroup>
        </div>
        <div className="col-sm-6">
          <FormGroup label={translate('Last name')}>
            <Field name="last_name" component={StringField} />
          </FormGroup>
        </div>
      </div>

      {isProfileAttributeEnabled('native_name') && (
        <FormGroup label={translate('Native name')}>
          <Field name="native_name" component={StringField} />
        </FormGroup>
      )}

      <h6 className="fw-bold mb-4 mt-6">
        {translate('Organization & Contact')}
      </h6>
      <FormGroup label={translate('Organization name')}>
        <Field name="organization" component={StringField} />
      </FormGroup>
      <FormGroup label={translate('Job position')}>
        <Field name="job_title" component={StringField} />
      </FormGroup>
      {isProfileAttributeEnabled('phone_number') && (
        <FormGroup
          label={translate('Phone number')}
          description={translate(
            'International format with country code, e.g. +1 202 555 1234',
          )}
        >
          <Field name="phone_number" component={StringField} />
        </FormGroup>
      )}

      <FormGroup
        label={translate('Description')}
        description={translate(
          'Additional account description invisible to user',
        )}
        spaceless
      >
        <Field name="description" component={TextField} />
      </FormGroup>
    </WizardModal>
  );
};
