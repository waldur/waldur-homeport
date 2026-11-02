import { FunctionComponent, useMemo, useState } from 'react';

import { Badge, PropertyItem, PropertyList } from 'waldur-ui';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import openstackIcon from '@/images/appstore/icon-openstack.png';
import { propVal } from '@/property/propertyFields';
import { QuotaBadge } from '@/quotas/QuotaBadge';
import { Quota } from '@/quotas/types';
import { formatQuota } from '@/quotas/utils';
import { ResourceSummaryBase, ResourceSummaryProps } from '@/resource/summary';
import { UserPassword } from '@/resource/UserPassword';

import { OpenStackTenant } from './types';

type OpenStackTenantSummaryProps = ResourceSummaryProps<OpenStackTenant>;

const formatAccess = (props: OpenStackTenantSummaryProps) => {
  if (!ENV.plugins.WALDUR_OPENSTACK.TENANT_CREDENTIALS_VISIBLE) {
    return null;
  }
  return props.resource.access_url
    ? propVal.url(props.resource.access_url, { text: translate('Open') })
    : translate('No access info.');
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
    <div className="flex flex-wrap">
      {(showAll ? quotas : quotas.slice(0, max)).map((quota) => (
        <QuotaBadge
          key={quota.name}
          quota={quota}
          image={openstackIcon}
          className="me-2.5 mb-1"
        />
      ))}
      {quotas.length > max && (
        <Badge
          variant="neutral"
          tone="outline"
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
        <ResourceSummaryBase resource={resource} hideBaseInfo />
        <PropertyItem label={translate('Access')} value={formatAccess(props)} />
        <PropertyItem
          label={translate('Username')}
          value={formatUsername(props)}
        />
        <PropertyItem
          label={translate('Password')}
          value={formatPassword(props)}
        />
        {formattedQuotas.map((quotaItem) => {
          return (
            <PropertyItem
              key={quotaItem.name}
              label={quotaItem.name}
              value={`${quotaItem.data.usage}/${quotaItem.data.limit}`}
            />
          );
        })}
        {quotas.length > 0 && (
          <PropertyItem
            label={translate('Quotas')}
            value={<QuotaBadges quotas={quotas} />}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <ResourceSummaryBase resource={resource} hideBaseInfo />
          <PropertyList variant="summary">
            <PropertyItem
              label={translate('Access')}
              value={formatAccess(props)}
            />
            <PropertyItem
              label={translate('Username')}
              value={formatUsername(props)}
            />
            <PropertyItem
              label={translate('Password')}
              value={formatPassword(props)}
            />
          </PropertyList>
        </div>
        <div>
          <PropertyList variant="summary">
            {formattedQuotas.map((quotaItem) => {
              return (
                <PropertyItem
                  key={quotaItem.name}
                  label={quotaItem.name}
                  value={`${quotaItem.data.usage}/${quotaItem.data.limit}`}
                />
              );
            })}
          </PropertyList>
        </div>
      </div>
      {quotas.length > 0 && (
        <div className="mt-3">
          <PropertyList variant="summary" termWidth="auto">
            <PropertyItem
              label={translate('Quotas')}
              value={<QuotaBadges quotas={quotas} />}
            />
          </PropertyList>
        </div>
      )}
    </>
  );
};
