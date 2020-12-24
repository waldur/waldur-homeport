import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { DashboardCounter } from '@waldur/dashboard/DashboardCounter';
import { translate } from '@waldur/i18n';
import { Project } from '@waldur/workspace/types';

interface ProjectCountersProps {
  project: Project;
}

export const ProjectCounters: FunctionComponent<ProjectCountersProps> = (
  props,
) => (
  <Row>
    <Col md={6}>
      <DashboardCounter
        label={translate('Estimated cost')}
        value={defaultCurrency(props.project.billing_price_estimate.total)}
      />
    </Col>
    <Col md={6}>
      <DashboardCounter
        label={translate('Cost threshold')}
        value={
          props.project.billing_price_estimate.threshold &&
          defaultCurrency(props.project.billing_price_estimate.threshold)
        }
      />
    </Col>
  </Row>
);
