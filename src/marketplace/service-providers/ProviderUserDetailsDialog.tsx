import { UserIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { MarketplaceServiceProviderUser } from 'waldur-js-client';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { isFeatureVisible } from '@/features/connect';
import { UserFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { propVal } from '@/property/propertyFields';
import { formatIsdName } from '@/user/support/IsdBadges';

interface ProviderUserDetailsDialogProps {
  resolve: { user: MarketplaceServiceProviderUser };
}

export interface SpUserFieldDef {
  key: keyof MarketplaceServiceProviderUser;
  label: () => string;
  copyable?: boolean;
  format?: (value: any, user: MarketplaceServiceProviderUser) => any;
}

export const SP_USER_FIELDS: SpUserFieldDef[] = [
  { key: 'full_name', label: () => translate('Full name'), copyable: true },
  { key: 'email', label: () => translate('Email'), copyable: true },
  {
    key: 'phone_number',
    label: () => translate('Phone number'),
    copyable: true,
  },
  { key: 'organization', label: () => translate('Organization') },
  { key: 'job_title', label: () => translate('Job title') },
  {
    key: 'affiliations',
    label: () => translate('Affiliations'),
    format: (v) => propVal.list(v),
  },
  { key: 'gender', label: () => translate('Gender') },
  { key: 'personal_title', label: () => translate('Personal title') },
  { key: 'place_of_birth', label: () => translate('Place of birth') },
  {
    key: 'country_of_residence',
    label: () => translate('Country of residence'),
  },
  { key: 'nationality', label: () => translate('Nationality') },
  {
    key: 'nationalities',
    label: () => translate('Nationalities'),
    format: (v) => propVal.list(v),
  },
  {
    key: 'organization_country',
    label: () => translate('Organization country'),
  },
  { key: 'organization_type', label: () => translate('Organization type') },
  {
    key: 'organization_registry_code',
    label: () => translate('Organization registry code'),
    copyable: true,
  },
  {
    key: 'organization_vat_code',
    label: () => translate('Organization VAT code'),
    copyable: true,
  },
  {
    key: 'organization_address',
    label: () => translate('Organization address'),
  },
  { key: 'eduperson_assurance', label: () => translate('EduPerson assurance') },
  {
    key: 'civil_number',
    label: () => translate('Civil number'),
    copyable: true,
  },
  {
    key: 'birth_date',
    label: () => translate('Birth date'),
    format: (v) => propVal.date(v),
  },
  { key: 'identity_source', label: () => translate('Registration method') },
];

export const ProviderUserDetailsDialog: FC<ProviderUserDetailsDialogProps> = ({
  resolve: { user },
}) => {
  return (
    <ModalDialog
      title={translate('User details')}
      subtitle={user.full_name}
      iconNode={<UserIcon weight="bold" />}
      iconColor="success"
      footer={<CloseDialogButton />}
    >
      <PropertyList termWidth="md">
        {SP_USER_FIELDS.map(({ key, label, copyable, format }) => {
          const rawValue = user[key];
          const value = format ? format(rawValue, user) : rawValue;
          return (
            <PropertyItem
              key={key}
              label={label()}
              value={value}
              copyable={copyable}
            />
          );
        })}
        <PropertyItem
          label={translate('Projects')}
          value={
            user.projects_count !== undefined
              ? translate('{count} projects', {
                  count: user.projects_count,
                })
              : null
          }
          hideIfEmpty
        />
        <PropertyItem
          label={translate('Status')}
          value={propVal.boolean(user.is_active, { wording: 'active' })}
          hideIfEmpty
        />
        {isFeatureVisible(UserFeatures.show_identity_bridge) && (
          <PropertyItem
            label={translate('Active ISDs')}
            value={propVal.badgeList(
              Array.isArray(user.active_isds)
                ? (user.active_isds as string[]).map(formatIsdName)
                : null,
              { variant: 'primary', tone: 'outline' },
            )}
            copyable
          />
        )}
      </PropertyList>
    </ModalDialog>
  );
};
