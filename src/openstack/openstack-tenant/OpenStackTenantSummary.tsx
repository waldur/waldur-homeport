import { FunctionComponent, useMemo, useState } from 'react';
import { Badge, Col, Container, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { ExternalLink } from '@waldur/core/ExternalLink';
import { translate } from '@waldur/i18n';
import openstackIcon from '@waldur/images/appstore/icon-openstack.png';
import { QuotaBadge } from '@waldur/quotas/QuotaBadge';
import { Quota } from '@waldur/quotas/types';
import { formatQuota } from '@waldur/quotas/utils';
import {
  Field,
  ResourceSummaryBase,
  ResourceSummaryProps,
} from '@waldur/resource/summary';
import { UserPassword } from '@waldur/resource/UserPassword';
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

const formatTenantQuotasSummary = (quotas: Quota[]) => {
  const parts = [];
  const vcpu = quotas.find((quota) => quota.name === 'vcpu');
  if (vcpu) {
    parts.push({ quota: vcpu, name: 'vCPU' });
  }
  const ram = quotas.find((quota) => quota.name === 'ram');
  if (ram) {
    parts.push({ quota: ram, name: 'RAM' });
  }

  const storage = quotas.find((quota) => quota.name === 'storage');
  const volumeTypeQuotas = quotas.filter((quota) =>
    quota.name.startsWith('gigabytes_'),
  );
  if (volumeTypeQuotas.length > 0) {
    volumeTypeQuotas.forEach((quota) => {
      parts.push({
        quota,
        name: quota.name.split('gigabytes_')[1],
      });
    });
  } else if (storage) {
    parts.push({
      quota: storage,
      name: 'storage',
    });
  }

  return parts.map((item) => ({
    data: formatQuota(item.quota),
    name: item.name,
  }));
};

const QuotaBadges = ({
  quotas,
  max = 4,
}: {
  quotas: Quota[];
  max?: number;
}) => {
  const [showAll, setShowAll] = useState(false);
  return (
    <div className="d-flex flex-wrap">
      {(showAll ? quotas : quotas.slice(0, max)).map((quota) => (
        <QuotaBadge
          key={quota.name}
          quota={quota}
          image={openstackIcon}
          className="me-3 mb-1"
        />
      ))}
      {quotas.length > max && (
        <Badge
          bg="secondary"
          text="dark"
          className="cursor-pointer mb-1"
          onClick={() => setShowAll((prev) => !prev)}
        >
          {showAll ? translate('Hide') : '...'}
        </Badge>
      )}
    </div>
  );
};

export const PureOpenStackTenantSummary: FunctionComponent<
  OpenStackTenantSummaryProps
> = (props) => {
  const { resource } = props;
  const formattedQuotas = useMemo(
    () => formatTenantQuotasSummary(resource.quotas),
    [resource.quotas],
  );

  const quotas = resource.quotas.filter(
    (quota) => !formattedQuotas.some((item) => item.data.name === quota.name),
  );

  return (
    <Container>
      <Row>
        <Col>
          <ResourceSummaryBase resource={resource} hideBaseInfo />
          <Field label={translate('Access')} value={formatAccess(props)} />
          <Field label={translate('Username')} value={formatUsername(props)} />
          <Field label={translate('Password')} value={formatPassword(props)} />
        </Col>
        <Col>
          {formattedQuotas.map((quotaItem) => {
            return (
              <Field
                key={quotaItem.name}
                label={quotaItem.name}
                value={`${quotaItem.data.usage}/${quotaItem.data.limit}`}
              />
            );
          })}
        </Col>
      </Row>
      {quotas.length > 0 && (
        <Field
          label={translate('Quotas')}
          value={<QuotaBadges quotas={quotas} />}
          className="mt-4"
          isStuck
        />
      )}
    </Container>
  );
};

const mapStateToProps = (state: RootState) => ({
  tenantCredentialsVisible:
    state.config.plugins.WALDUR_OPENSTACK.TENANT_CREDENTIALS_VISIBLE,
});

const enhance = compose(connect(mapStateToProps));

export const OpenStackTenantSummary = enhance(PureOpenStackTenantSummary);
