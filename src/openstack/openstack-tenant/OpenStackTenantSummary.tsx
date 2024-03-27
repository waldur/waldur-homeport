import { FunctionComponent, useMemo } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { ExternalLink } from '@waldur/core/ExternalLink';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { Quota } from '@waldur/quotas/types';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';
import { UserPassword } from '@waldur/resource/UserPassword';
import { isVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';

import { OpenStackTenant } from './types';

interface OpenStackTenantSummaryProps
  extends ResourceSummaryProps<OpenStackTenant> {
  tenantCredentialsVisible: boolean;
  volumeTypeVisible: boolean;
}

const formatAccess = (props: OpenStackTenantSummaryProps) => {
  if (!props.tenantCredentialsVisible) {
    return null;
  }
  if (!props.resource.access_url) {
    return translate('No access info.');
  }
  return (
    <ExternalLink label={translate('Open')} url={props.resource.access_url} />
  );
};

const formatUsername = (props: OpenStackTenantSummaryProps) =>
  props.tenantCredentialsVisible ? props.resource.user_username : null;

const formatPassword = (props: OpenStackTenantSummaryProps) =>
  props.tenantCredentialsVisible && props.resource.user_password ? (
    <UserPassword password={props.resource.user_password} />
  ) : null;

const formatTenantSummary = (quotas: Quota[], volumeTypeVisible) => {
  const parts = [
    {
      quota: quotas.find((quota) => quota.name === 'vcpu'),
      name: 'vCPU',
    },
    {
      quota: quotas.find((quota) => quota.name === 'ram'),
      name: 'RAM',
    },
  ];
  if (volumeTypeVisible) {
    quotas
      .filter((quota) => quota.name.startsWith('gigabytes_'))
      .forEach((quota) => {
        parts.push({
          quota,
          name: quota.name.split('gigabytes_')[1],
        });
      });
  } else {
    parts.push({
      quota: quotas.find((quota) => quota.name === 'storage'),
      name: 'storage',
    });
  }
  return parts
    .map((part) =>
      translate('{usage} of {limit} {name}', {
        limit:
          part.name === 'vCPU'
            ? part.quota.limit
            : formatFilesize(part.quota.limit),
        usage:
          part.name === 'vCPU'
            ? part.quota.usage
            : formatFilesize(part.quota.usage),
        name: part.name,
      }),
    )
    .join(', ');
};

export const PureOpenStackTenantSummary: FunctionComponent<
  OpenStackTenantSummaryProps
> = (props) => {
  const { resource } = props;
  const summary = useMemo(
    () => formatTenantSummary(resource.quotas, props.volumeTypeVisible),
    [resource.quotas, props.volumeTypeVisible],
  );
  return (
    <>
      <Field
        label={translate('Summary')}
        value={
          resource.marketplace_offering_name
            ? `${resource.marketplace_offering_name} (${summary})`
            : summary
        }
      />
      <Field label={translate('Access')} value={formatAccess(props)} />
      <Field label={translate('Username')} value={formatUsername(props)} />
      <Field label={translate('Password')} value={formatPassword(props)} />
      <Field
        label={translate('Internal network ID')}
        value={resource.internal_network_id}
      />
      <Field
        label={translate('External network ID')}
        value={resource.external_network_id}
      />
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  tenantCredentialsVisible:
    state.config.plugins.WALDUR_OPENSTACK.TENANT_CREDENTIALS_VISIBLE,
  volumeTypeVisible: isVisible(state, 'openstack.volume_type'),
});

const enhance = compose(connect(mapStateToProps));

export const OpenStackTenantSummary = enhance(PureOpenStackTenantSummary);
