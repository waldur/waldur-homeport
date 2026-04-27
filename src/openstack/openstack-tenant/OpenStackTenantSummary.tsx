import { FunctionComponent, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';

import { Badge } from '@/core/Badge';
import { ENV } from '@/core/config';
import { ExternalLink } from '@/core/ExternalLink';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import openstackIcon from '@/images/appstore/icon-openstack.png';
import { QuotaBadge } from '@/quotas/QuotaBadge';
import { Quota } from '@/quotas/types';
import { formatQuota } from '@/quotas/utils';
import {
  Field,
  ResourceSummaryBase,
  ResourceSummaryProps,
} from '@/resource/summary';
import { UserPassword } from '@/resource/UserPassword';

import { OpenStackTenant } from './types';

type OpenStackTenantSummaryProps = ResourceSummaryProps<OpenStackTenant>;

const formatAccess = (props: OpenStackTenantSummaryProps) => {
  if (!ENV.plugins.WALDUR_OPENSTACK.TENANT_CREDENTIALS_VISIBLE) {
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
  ENV.plugins.WALDUR_OPENSTACK.TENANT_CREDENTIALS_VISIBLE
    ? props.resource.user_username
    : null;

const formatPassword = (props: OpenStackTenantSummaryProps) =>
  ENV.plugins.WALDUR_OPENSTACK.TENANT_CREDENTIALS_VISIBLE &&
  props.resource.user_password ? (
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
          variant="default"
          outline
          className="cursor-pointer mb-1"
          onClick={() => setShowAll((prev) => !prev)}
        >
          {showAll ? translate('Hide') : '...'}
        </Badge>
      )}
    </div>
  );
};

export const OpenStackTenantSummary: FunctionComponent<
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

  if (props.formTableItem) {
    return (
      <>
        <ResourceSummaryBase
          resource={resource}
          hideBaseInfo
          formTableItem={props.formTableItem}
        />
        <FormTable.Item
          label={translate('Access')}
          value={formatAccess(props)}
        />
        <FormTable.Item
          label={translate('Username')}
          value={formatUsername(props)}
        />
        <FormTable.Item
          label={translate('Password')}
          value={formatPassword(props)}
        />
        {formattedQuotas.map((quotaItem) => {
          return (
            <FormTable.Item
              key={quotaItem.name}
              label={quotaItem.name}
              value={`${quotaItem.data.usage}/${quotaItem.data.limit}`}
            />
          );
        })}
        {quotas.length > 0 && (
          <FormTable.Item
            label={translate('Quotas')}
            value={<QuotaBadges quotas={quotas} />}
          />
        )}
      </>
    );
  }

  return (
    <>
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
        <Row className="mt-4">
          <Col>
            <Field
              label={translate('Quotas')}
              value={<QuotaBadges quotas={quotas} />}
              isStuck
            />
          </Col>
        </Row>
      )}
    </>
  );
};
