import { FC } from 'react';
import { useFormState } from 'react-final-form';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import {
  getGenderChoices,
  getOrganizationTypeOptions,
} from '@/user/support/aai-constants';
import { isProfileAttributeEnabled } from '@/user/support/profileAttributes';
import { WizardModal, WizardStepProps } from '@/wizard';

import { UserFormData, UserFormDialogData } from '../UserFormTypes';

export const ReviewStep: FC<WizardStepProps> = (props) => {
  const { values } = useFormState<UserFormData>();
  const { editMode } = (props.data || {}) as UserFormDialogData;

  const hasIdentityProfileAttributes =
    isProfileAttributeEnabled('personal_title') ||
    isProfileAttributeEnabled('gender') ||
    isProfileAttributeEnabled('place_of_birth') ||
    isProfileAttributeEnabled('country_of_residence') ||
    isProfileAttributeEnabled('nationality') ||
    isProfileAttributeEnabled('organization_country') ||
    isProfileAttributeEnabled('organization_type') ||
    isProfileAttributeEnabled('organization_registry_code') ||
    isProfileAttributeEnabled('organization_vat_code') ||
    isProfileAttributeEnabled('organization_address');

  return (
    <WizardModal {...props}>
      {editMode && (
        <p className="text-quaternary mb-3">
          {translate('Review the changes below and click Save to apply them.')}
        </p>
      )}
      <PropertyList
        variant="summary"
        termWidth="md"
        hideIfEmpty={false}
        className="flex flex-col gap-6"
      >
        <PropertyList.Section title={translate('Account')}>
          <PropertyItem label={translate('Username')} value={values.username} />
          <PropertyItem label={translate('Email')} value={values.email} />
          <PropertyItem
            label={translate('Active')}
            value={propVal.boolean(values.is_active, { colored: true })}
          />
          <PropertyItem
            label={translate('Staff')}
            value={propVal.boolean(values.is_staff, { colored: true })}
          />
          <PropertyItem
            label={translate('Support')}
            value={propVal.boolean(values.is_support, { colored: true })}
          />
          <PropertyItem
            label={translate('Password')}
            value={
              values.remove_password ? (
                <span className="text-danger">
                  {translate('Will be removed')}
                </span>
              ) : values.password ? (
                <span className="text-success">{translate('Will be set')}</span>
              ) : undefined
            }
            placeholder={editMode ? translate('No changes') : 'not-set'}
          />
        </PropertyList.Section>

        <PropertyList.Section title={translate('Personal information')}>
          <PropertyItem
            label={translate('First name')}
            value={values.first_name}
          />
          <PropertyItem
            label={translate('Last name')}
            value={values.last_name}
          />
          {isProfileAttributeEnabled('native_name') && (
            <PropertyItem
              label={translate('Native name')}
              value={values.native_name}
            />
          )}
          <PropertyItem
            label={translate('Organization')}
            value={values.organization}
          />
          <PropertyItem
            label={translate('Job position')}
            value={values.job_title}
          />
          {isProfileAttributeEnabled('phone_number') && (
            <PropertyItem
              label={translate('Phone number')}
              value={values.phone_number}
            />
          )}
          <PropertyItem
            label={translate('Description')}
            value={values.description}
          />
        </PropertyList.Section>

        {hasIdentityProfileAttributes && (
          <PropertyList.Section title={translate('Identity & Profile')}>
            {isProfileAttributeEnabled('personal_title') && (
              <PropertyItem
                label={translate('Personal title')}
                value={values.personal_title}
              />
            )}
            {isProfileAttributeEnabled('gender') && (
              <PropertyItem
                label={translate('Gender')}
                value={propVal.enum(values.gender, {
                  options: getGenderChoices(),
                })}
              />
            )}
            {isProfileAttributeEnabled('place_of_birth') && (
              <PropertyItem
                label={translate('Place of birth')}
                value={values.place_of_birth}
              />
            )}
            {isProfileAttributeEnabled('country_of_residence') && (
              <PropertyItem
                label={translate('Country of residence')}
                value={values.country_of_residence}
              />
            )}
            {isProfileAttributeEnabled('nationality') && (
              <PropertyItem
                label={translate('Nationality')}
                value={values.nationality}
              />
            )}
            {isProfileAttributeEnabled('nationalities') &&
              values.nationalities?.length > 0 && (
                <PropertyItem
                  label={translate('Nationalities')}
                  value={propVal.list(values.nationalities)}
                />
              )}
            {isProfileAttributeEnabled('organization_country') && (
              <PropertyItem
                label={translate('Organization country')}
                value={values.organization_country}
              />
            )}
            {isProfileAttributeEnabled('organization_type') && (
              <PropertyItem
                label={translate('Organization type')}
                value={propVal.enum(values.organization_type, {
                  options: getOrganizationTypeOptions(),
                })}
              />
            )}
            {isProfileAttributeEnabled('organization_registry_code') && (
              <PropertyItem
                label={translate('Organization registry code')}
                value={values.organization_registry_code}
              />
            )}
            {isProfileAttributeEnabled('organization_vat_code') && (
              <PropertyItem
                label={translate('Organization VAT code')}
                value={values.organization_vat_code}
              />
            )}
            {isProfileAttributeEnabled('organization_address') && (
              <PropertyItem
                label={translate('Organization address')}
                value={values.organization_address}
              />
            )}
          </PropertyList.Section>
        )}
      </PropertyList>
    </WizardModal>
  );
};
