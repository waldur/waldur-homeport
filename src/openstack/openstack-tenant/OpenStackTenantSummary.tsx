import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { ExternalLink } from '@waldur/core/ExternalLink';
import { withTranslation } from '@waldur/i18n';
import { getTenantTemplate } from '@waldur/openstack/utils';
import { Field, ResourceSummaryProps, PureResourceSummaryBase } from '@waldur/resource/summary';
import { UserPassword } from '@waldur/resource/UserPassword';

import { OpenStackTenant } from './types';
import { formatPackage } from './utils';

interface OpenStackTenantSummaryProps extends ResourceSummaryProps<OpenStackTenant> {
  tenantCredentialsVisible: boolean;
}

const formatAccess = (props: OpenStackTenantSummaryProps) => {
  if (!props.tenantCredentialsVisible) {
    return null;
  }
  if (!props.resource.access_url) {
    return props.translate('No access info.');
  }
  return (
    <ExternalLink
      label={props.translate('Open')}
      url={props.resource.access_url}
    />
  );
};

const formatUsername = (props: OpenStackTenantSummaryProps) =>
  props.tenantCredentialsVisible ? props.resource.user_username : null;

const formatPassword = (props: OpenStackTenantSummaryProps) =>
  props.tenantCredentialsVisible && props.resource.user_password ?
  // @ts-ignore
  <UserPassword password={props.resource.user_password}/> : null;

export const PureOpenStackTenantSummary = (props: OpenStackTenantSummaryProps) => {
  const { translate, resource } = props;
  const template = getTenantTemplate(resource);
  return (
    <>
      <PureResourceSummaryBase {...props}/>
      {template && (
        <Field
          label={translate('Package')}
          value={formatPackage(template)}
        />
      )}
      <Field
        label={translate('Access')}
        value={formatAccess(props)}
      />
      <Field
        label={translate('Username')}
        value={formatUsername(props)}
      />
      <Field
        label={translate('Password')}
        value={formatPassword(props)}
      />
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

const mapStateToProps = state => ({
  tenantCredentialsVisible: state.config.plugins.WALDUR_OPENSTACK.TENANT_CREDENTIALS_VISIBLE,
});

const enhance = compose(connect(mapStateToProps), withTranslation);

export const OpenStackTenantSummary = enhance(PureOpenStackTenantSummary);
