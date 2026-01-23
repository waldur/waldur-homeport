import { UserIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { MarketplaceServiceProviderUser } from 'waldur-js-client';

import { FieldWithCopy } from '@waldur/core/FieldWithCopy';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

interface ProviderUserDetailsDialogProps {
  resolve: { user: MarketplaceServiceProviderUser };
}

const formatValue = (value: unknown): string => {
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
        {user.full_name && (
          <FormTable.Item
            label={translate('Full name')}
            value={<FieldWithCopy value={formatValue(user.full_name)} />}
          />
        )}
        {user.email && (
          <FormTable.Item
            label={translate('Email')}
            value={<FieldWithCopy value={formatValue(user.email)} />}
          />
        )}
        {user.phone_number && (
          <FormTable.Item
            label={translate('Phone number')}
            value={<FieldWithCopy value={formatValue(user.phone_number)} />}
          />
        )}
        {user.organization && (
          <FormTable.Item
            label={translate('Organization')}
            value={<FieldWithCopy value={formatValue(user.organization)} />}
          />
        )}
        {user.affiliations && (
          <FormTable.Item
            label={translate('Affiliations')}
            value={<FieldWithCopy value={formatValue(user.affiliations)} />}
          />
        )}
        {user.projects_count !== undefined && (
          <FormTable.Item
            label={translate('Projects')}
            value={translate('{count} projects', {
              count: user.projects_count,
            })}
          />
        )}
        {user.registration_method && (
          <FormTable.Item
            label={translate('Registration method')}
            value={formatValue(user.registration_method)}
          />
        )}
        {user.is_active !== undefined && (
          <FormTable.Item
            label={translate('Status')}
            value={user.is_active ? translate('Active') : translate('Inactive')}
          />
        )}
      </FormTable>
    </ModalDialog>
  );
};
