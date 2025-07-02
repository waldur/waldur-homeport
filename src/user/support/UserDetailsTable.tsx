import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { User } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { FieldWithCopy } from '@waldur/core/FieldWithCopy';
import { isFeatureVisible } from '@waldur/features/connect';
import { UserFeatures } from '@waldur/FeaturesEnums';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { getNativeNameVisible } from '@waldur/store/config';
import { type RootState } from '@waldur/store/reducers';
import {
  formatUserIsActive,
  formatUserStatus,
} from '@waldur/user/support/utils';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

interface OwnProps {
  user: User;
  profile?: any;
  hasHeader?: boolean;
}

export const UserDetailsTable: FunctionComponent<OwnProps> = (props) => {
  const isVisible = useSelector((state: RootState) => isStaffOrSupport(state));

  return (
    <FormTable hideActions alignTop detailsMode className="gy-5">
      <FormTable.Item
        label={translate('Full name')}
        value={<FieldWithCopy value={props.user.full_name} />}
      />

      {getNativeNameVisible() && (
        <FormTable.Item
          label={translate('Native name')}
          value={<FieldWithCopy value={props.user.native_name} />}
        />
      )}
      <FormTable.Item
        label={translate('ID code')}
        value={<FieldWithCopy value={props.user.civil_number} />}
      />

      <FormTable.Item
        label={translate('Phone numbers')}
        value={<FieldWithCopy value={props.user.phone_number} />}
      />

      <FormTable.Item
        label={translate('Username')}
        value={<FieldWithCopy value={props.user.username} />}
      />

      <FormTable.Item
        label={translate('Email')}
        value={<FieldWithCopy value={props.user.email} />}
      />

      {isFeatureVisible(UserFeatures.show_slug) && (
        <FormTable.Item
          label={translate('Shortname')}
          value={<FieldWithCopy value={props.user.slug} />}
        />
      )}
      {isFeatureVisible(UserFeatures.preferred_language) && (
        <FormTable.Item
          label={translate('Preferred language')}
          value={props.user.preferred_language}
        />
      )}
      <FormTable.Item
        label={translate('Registration method')}
        value={<FieldWithCopy value={props.user.identity_provider_label} />}
      />

      <FormTable.Item
        label={translate('Date joined')}
        value={<FieldWithCopy value={formatDateTime(props.user.date_joined)} />}
      />

      <FormTable.Item
        label={translate('Organization')}
        value={<FieldWithCopy value={props.user.organization} />}
      />

      <FormTable.Item
        label={translate('Job position')}
        value={<FieldWithCopy value={props.user.job_title} />}
      />

      {Array.isArray(props.user.affiliations) &&
      props.user.affiliations.length > 0 ? (
        <FormTable.Item
          label={translate('Affiliations')}
          value={<FieldWithCopy value={props.user.affiliations.join(', ')} />}
        />
      ) : null}
      {isVisible && (
        <FormTable.Item
          label={translate('User type')}
          value={formatUserStatus(props.user)}
        />
      )}
      {isVisible && (
        <FormTable.Item
          label={translate('Account status')}
          value={formatUserIsActive(props.user)}
        />
      )}
      {props.profile?.is_active && (
        <FormTable.Item
          label={translate('FreeIPA')}
          value={<FieldWithCopy value={props.profile?.username} />}
        />
      )}
    </FormTable>
  );
};
