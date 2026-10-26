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

import { getLockReason, lockedProps, lockedSelectProps } from './lockedFields';

export const IdentityStep: FC<WizardStepProps> = (props) => {
  const nationalitiesLock = getLockReason(props.data, 'nationalities');
  const hasAnyField =
    isProfileAttributeEnabled('personal_title') ||
    isProfileAttributeEnabled('gender') ||
    isProfileAttributeEnabled('place_of_birth') ||
    isProfileAttributeEnabled('country_of_residence') ||
    isProfileAttributeEnabled('nationality') ||
    isProfileAttributeEnabled('nationalities') ||
    isProfileAttributeEnabled('organization_country') ||
    isProfileAttributeEnabled('organization_type') ||
    isProfileAttributeEnabled('organization_registry_code') ||
    isProfileAttributeEnabled('organization_vat_code') ||
    isProfileAttributeEnabled('organization_address');

  return (
    <WizardModal {...props}>
      {!hasAnyField && (
        <p className="text-quaternary">
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
          {...lockedSelectProps(props.data, 'personal_title')}
        />
      )}
      {isProfileAttributeEnabled('gender') && (
        <SelectGroup
          name="gender"
          options={getGenderChoices()}
          simpleValue
          isClearable
          label={translate('Gender')}
          {...lockedSelectProps(props.data, 'gender')}
        />
      )}
      {isProfileAttributeEnabled('place_of_birth') && (
        <StringGroup
          name="place_of_birth"
          label={translate('Place of birth')}
          {...lockedProps(props.data, 'place_of_birth')}
        />
      )}
      {isProfileAttributeEnabled('country_of_residence') && (
        <CountrySelectGroup
          name="country_of_residence"
          label={translate('Country of residence')}
          {...lockedSelectProps(props.data, 'country_of_residence')}
        />
      )}
      {isProfileAttributeEnabled('nationality') && (
        <CountrySelectGroup
          name="nationality"
          label={translate('Nationality')}
          {...lockedSelectProps(props.data, 'nationality')}
        />
      )}
      {isProfileAttributeEnabled('nationalities') && (
        <FormGroup
          label={translate('Nationalities')}
          description={nationalitiesLock}
        >
          <Field name="nationalities">
            {({ input, meta }) => (
              <MultiCountrySelectField
                input={input}
                meta={meta}
                isDisabled={Boolean(nationalitiesLock)}
              />
            )}
          </Field>
        </FormGroup>
      )}
      {isProfileAttributeEnabled('organization_country') && (
        <CountrySelectGroup
          name="organization_country"
          label={translate('Organization country')}
          {...lockedSelectProps(props.data, 'organization_country')}
        />
      )}
      {isProfileAttributeEnabled('organization_type') && (
        <SelectGroup
          name="organization_type"
          options={getOrganizationTypeOptions()}
          simpleValue
          isClearable
          label={translate('Organization type')}
          {...lockedSelectProps(props.data, 'organization_type')}
        />
      )}
      {isProfileAttributeEnabled('organization_registry_code') && (
        <StringGroup
          name="organization_registry_code"
          label={translate('Organization registry code')}
          {...lockedProps(props.data, 'organization_registry_code')}
        />
      )}
      {isProfileAttributeEnabled('organization_vat_code') && (
        <StringGroup
          name="organization_vat_code"
          label={translate('Organization VAT code')}
          {...lockedProps(props.data, 'organization_vat_code')}
        />
      )}
      {isProfileAttributeEnabled('organization_address') && (
        <StringGroup
          name="organization_address"
          label={translate('Organization address')}
          {...lockedProps(props.data, 'organization_address')}
        />
      )}
    </WizardModal>
  );
};
