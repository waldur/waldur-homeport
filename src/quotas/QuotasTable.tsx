import { Col, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { formatQuotaValue, formatQuotaName } from './utils';

interface Quota {
  name: string;
  usage: number;
  limit: number;
}

interface Resource {
  quotas: Quota[];
}

export const QuotasTable = ({ resource }: { resource: Resource }) =>
  resource.quotas.length === 0 ? (
    <div className="row text-center">
      {translate('You have no quotas yet.')}
    </div>
  ) : (
    <div className="provider-quotas">
      {resource.quotas
        .sort((q1, q2) => q1.name.localeCompare(q2.name))
        .map((quota) => (
          <Row key={quota.name} className="mb-2">
            <Col sm={4} xs={6}>
              {formatQuotaName(quota.name)}:
            </Col>
            <Col sm={8} xs={6}>
              {translate('{usage} of {limit}', {
                usage: formatQuotaValue(quota.usage, quota.name),
                limit: formatQuotaValue(quota.limit, quota.name),
              })}
            </Col>
          </Row>
        ))}
    </div>
  );
