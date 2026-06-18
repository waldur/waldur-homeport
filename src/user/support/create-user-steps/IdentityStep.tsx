import { FC } from 'react';
import { Field } from 'react-final-form';

import { SelectGroup, StringGroup, CountrySelectGroup } from '@/form';
import { FormGroup } from '@/form';
import { MultiCountrySelectField } from '@/form/MultiCountrySelectField';
import { translate } from '@/i18n';
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
        <SelectGroup
          name="personal_title"
          options={getPersonalTitleOptions()}
          simpleValue
          isClearable
          label={translate('Personal title')}
        />
      )}
      {isProfileAttributeEnabled('gender') && (
        <SelectGroup
          name="gender"
          options={getGenderChoices()}
          simpleValue
          isClearable
          label={translate('Gender')}
        />
      )}
      {isProfileAttributeEnabled('place_of_birth') && (
        <StringGroup
          name="place_of_birth"
          label={translate('Place of birth')}
        />
      )}
      {isProfileAttributeEnabled('country_of_residence') && (
        <CountrySelectGroup
          name="country_of_residence"
          label={translate('Country of residence')}
        />
      )}
      {isProfileAttributeEnabled('nationality') && (
        <CountrySelectGroup
          name="nationality"
          label={translate('Nationality')}
        />
      )}
      {isProfileAttributeEnabled('nationalities') && (
        <FormGroup label={translate('Nationalities')}>
          <Field name="nationalities">
            {({ input, meta }) => (
              <MultiCountrySelectField input={input} meta={meta} />
            )}
          </Field>
        </FormGroup>
      )}
      {isProfileAttributeEnabled('organization_country') && (
        <CountrySelectGroup
          name="organization_country"
          label={translate('Organization country')}
        />
      )}
      {isProfileAttributeEnabled('organization_type') && (
        <SelectGroup
          name="organization_type"
          options={getOrganizationTypeOptions()}
          simpleValue
          isClearable
          label={translate('Organization type')}
        />
      )}
      {isProfileAttributeEnabled('organization_registry_code') && (
        <StringGroup
          name="organization_registry_code"
          label={translate('Organization registry code')}
          spaceless
        />
      )}
    </WizardModal>
  );
};
