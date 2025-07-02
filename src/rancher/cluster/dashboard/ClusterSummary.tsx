import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import { RancherCluster } from 'waldur-js-client';

import { BooleanBadge } from '@waldur/core/BooleanBadge';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

export const ClusterSummary: FC<{
  resourceScope: RancherCluster;
  refetch: any;
}> = ({ resourceScope }) => {
  return (
    <Row className="fs-6">
      <Col xl={6} xxl={4}>
        <Field
          className="mb-2"
          label={translate('Kubernetes version')}
          value={resourceScope?.kubernetes_version || 'N/A'}
          labelCol={6}
          valueCol={6}
        />
        {resourceScope?.public_ips?.length > 0 && (
          <Field
            className="mb-2"
            label={translate('Load balancer IPs')}
            value={
              resourceScope?.public_ips
                .map((item) =>
                  item.external_ip_address
                    ? `${item.ip_address}/${item.external_ip_address}`
                    : item.ip_address,
                )
                .join(',') || 'N/A'
            }
            hasCopy={Boolean(resourceScope?.public_ips?.length)}
            labelCol={6}
            valueCol={6}
          />
        )}
        {resourceScope?.router_ips?.length > 0 && (
          <Field
            className="mb-2"
            label={translate('Router IPs')}
            value={resourceScope?.router_ips.join(',') || 'N/A'}
            hasCopy={Boolean(resourceScope?.router_ips?.length)}
            labelCol={6}
            valueCol={6}
          />
        )}
        <Field
          className="mb-2"
          label={translate('Longhorn')}
          labelCol={6}
          valueCol={6}
          value={<BooleanBadge value={resourceScope?.install_longhorn} />}
        />
      </Col>
    </Row>
  );
};
