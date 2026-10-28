import { FC } from 'react';
import { RancherCluster } from 'waldur-js-client';

import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { BooleanField } from '@/table/BooleanField';
import { renderFieldOrDash } from '@/table/utils';

export const ClusterSummary: FC<{
  resourceScope: RancherCluster;
  refetch: any;
}> = ({ resourceScope }) => {
  return (
    <div className="text-sm">
      <div className="xl:w-6/12 2xl:w-4/12">
        <Field
          className="mb-1.5"
          label={translate('Kubernetes version')}
          value={renderFieldOrDash(resourceScope?.kubernetes_version)}
          labelCol={6}
          valueCol={6}
        />
        {resourceScope?.public_ips?.length > 0 && (
          <Field
            className="mb-1.5"
            label={translate('Load balancer IPs')}
            value={renderFieldOrDash(
              resourceScope?.public_ips
                .map((item) =>
                  item.external_ip_address
                    ? `${item.ip_address}/${item.external_ip_address}`
                    : item.ip_address,
                )
                .join(','),
            )}
            hasCopy={Boolean(resourceScope?.public_ips?.length)}
            labelCol={6}
            valueCol={6}
          />
        )}
        {resourceScope?.router_ips?.length > 0 && (
          <Field
            className="mb-1.5"
            label={translate('Router IPs')}
            value={renderFieldOrDash(resourceScope?.router_ips.join(','))}
            hasCopy={Boolean(resourceScope?.router_ips?.length)}
            labelCol={6}
            valueCol={6}
          />
        )}
        <Field
          className="mb-1.5"
          label={translate('Longhorn')}
          labelCol={6}
          valueCol={6}
          value={<BooleanField value={resourceScope?.install_longhorn} />}
        />
      </div>
    </div>
  );
};
