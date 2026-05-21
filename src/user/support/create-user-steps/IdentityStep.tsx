import { FC } from 'react';
import { Field } from 'react-final-form';

import { CountrySelectField } from '@/form/CountrySelectField';
import { MultiCountrySelectField } from '@/form/MultiCountrySelectField';
import { SelectField } from '@/form/SelectField';
import { StringField } from '@/form/StringField';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import {
  getGenderChoices,
  getOrganizationTypeOptions,
  getPersonalTitleOptions,
} from '@/user/support/aai-constants';
import { isProfileAttributeEnabled } from '@/user/support/profileAttributes';
import { WizardModal, WizardStepProps } from '@/wizard';

export const IdentityStep: FC<WizardStepProps> = (props) => {
  const hasAnyField =
    isProfileAttributeEnabled('personal_title') ||
    isProfileAttributeEnabled('gender') ||
    isProfileAttributeEnabled('place_of_birth') ||
    isProfileAttributeEnabled('country_of_residence') ||
    isProfileAttributeEnabled('nationality') ||
    isProfileAttributeEnabled('nationalities') ||
    isProfileAttributeEnabled('organization_country') ||
    isProfileAttributeEnabled('organization_type') ||
    isProfileAttributeEnabled('organization_registry_code');

  return (
    <WizardModal {...props}>
      {!hasAnyField && (
        <p className="text-muted">
          {translate(
            'No additional identity fields are enabled in this deployment.',
          )}
        </p>
      )}

      {isProfileAttributeEnabled('personal_title') && (
        <FormGroup label={translate('Personal title')}>
          <Field
            name="personal_title"
            component={SelectField}
            options={getPersonalTitleOptions()}
            simpleValue
            isClearable
          />
        </FormGroup>
      )}

      {isProfileAttributeEnabled('gender') && (
        <FormGroup label={translate('Gender')}>
          <Field
            name="gender"
            component={SelectField}
            options={getGenderChoices()}
            simpleValue
            isClearable
          />
        </FormGroup>
      )}

      {isProfileAttributeEnabled('place_of_birth') && (
        <FormGroup label={translate('Place of birth')}>
          <Field name="place_of_birth" component={StringField} />
        </FormGroup>
      )}

      {isProfileAttributeEnabled('country_of_residence') && (
        <FormGroup label={translate('Country of residence')}>
          <Field name="country_of_residence" component={CountrySelectField} />
        </FormGroup>
      )}

      {isProfileAttributeEnabled('nationality') && (
        <FormGroup label={translate('Nationality')}>
          <Field name="nationality" component={CountrySelectField} />
        </FormGroup>
      )}

      {isProfileAttributeEnabled('nationalities') && (
        <FormGroup label={translate('Nationalities')}>
          <Field name="nationalities" component={MultiCountrySelectField} />
        </FormGroup>
      )}

      {isProfileAttributeEnabled('organization_country') && (
        <FormGroup label={translate('Organization country')}>
          <Field name="organization_country" component={CountrySelectField} />
        </FormGroup>
      )}

      {isProfileAttributeEnabled('organization_type') && (
        <FormGroup label={translate('Organization type')}>
          <Field
            name="organization_type"
            component={SelectField}
            options={getOrganizationTypeOptions()}
            simpleValue
            isClearable
          />
        </FormGroup>
      )}

      {isProfileAttributeEnabled('organization_registry_code') && (
        <FormGroup label={translate('Organization registry code')} spaceless>
          <Field name="organization_registry_code" component={StringField} />
        </FormGroup>
      )}
    </WizardModal>
  );
};
