import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import { RancherCluster } from 'waldur-js-client';

import { BooleanBadge } from '@waldur/core/BooleanBadge';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { renderFieldOrDash } from '@waldur/table/utils';

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
          value={renderFieldOrDash(resourceScope?.kubernetes_version)}
          labelCol={6}
          valueCol={6}
        />
        {resourceScope?.public_ips?.length > 0 && (
          <Field
            className="mb-2"
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
            className="mb-2"
            label={translate('Router IPs')}
            value={renderFieldOrDash(resourceScope?.router_ips.join(','))}
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
