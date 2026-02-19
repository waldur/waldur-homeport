import { UserIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { MarketplaceServiceProviderUser } from 'waldur-js-client';

import { FieldWithCopy } from '@waldur/core/FieldWithCopy';
import { isFeatureVisible } from '@waldur/features/connect';
import { UserFeatures } from '@waldur/FeaturesEnums';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { IsdBadges } from '@waldur/user/support/IsdBadges';

interface ProviderUserDetailsDialogProps {
  resolve: { user: MarketplaceServiceProviderUser };
}

export const SP_USER_FIELDS: Array<{
  key: keyof MarketplaceServiceProviderUser;
  label: () => string;
}> = [
  { key: 'full_name', label: () => translate('Full name') },
  { key: 'email', label: () => translate('Email') },
  { key: 'phone_number', label: () => translate('Phone number') },
  { key: 'organization', label: () => translate('Organization') },
  { key: 'job_title', label: () => translate('Job title') },
  { key: 'affiliations', label: () => translate('Affiliations') },
  { key: 'gender', label: () => translate('Gender') },
  { key: 'personal_title', label: () => translate('Personal title') },
  { key: 'place_of_birth', label: () => translate('Place of birth') },
  {
    key: 'country_of_residence',
    label: () => translate('Country of residence'),
  },
  { key: 'nationality', label: () => translate('Nationality') },
  { key: 'nationalities', label: () => translate('Nationalities') },
  {
    key: 'organization_country',
    label: () => translate('Organization country'),
  },
  { key: 'organization_type', label: () => translate('Organization type') },
  {
    key: 'organization_registry_code',
    label: () => translate('Organization registry code'),
  },
  { key: 'eduperson_assurance', label: () => translate('EduPerson assurance') },
  { key: 'civil_number', label: () => translate('Civil number') },
  { key: 'birth_date', label: () => translate('Birth date') },
  { key: 'identity_source', label: () => translate('Registration method') },
];

export const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return DASH_ESCAPE_CODE;
  }
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : DASH_ESCAPE_CODE;
  }
  return String(value);
};

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
      <FormTable hideActions detailsMode className="gy-5">
        {SP_USER_FIELDS.map(({ key, label }) => (
          <FormTable.Item
            key={key}
            label={label()}
            value={<FieldWithCopy value={formatValue(user[key])} />}
          />
        ))}
        {user.projects_count !== undefined && (
          <FormTable.Item
            label={translate('Projects')}
            value={translate('{count} projects', {
              count: user.projects_count,
            })}
          />
        )}
        {user.is_active !== undefined && (
          <FormTable.Item
            label={translate('Status')}
            value={user.is_active ? translate('Active') : translate('Inactive')}
          />
        )}
        {isFeatureVisible(UserFeatures.show_identity_bridge) &&
          Array.isArray(user.active_isds) &&
          (user.active_isds as string[]).length > 0 && (
            <FormTable.Item
              label={translate('Active ISDs')}
              value={<IsdBadges isds={user.active_isds as string[]} />}
            />
          )}
      </FormTable>
    </ModalDialog>
  );
};
