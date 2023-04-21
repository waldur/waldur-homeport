import { Col, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { ProviderOfferingsComponent } from '@waldur/marketplace/service-providers/ProviderOfferingsList';

import { ProviderActionLogs } from './ProviderActionLogs';
import { ProviderDashboardChart } from './ProviderDashboardChart';
import { ProviderProfile } from './ProviderProfile';
import { ProviderWidgets } from './ProviderWidgets';

export const ProviderDashboard = ({ provider }) => {
  return (
    <>
      <ProviderProfile provider={provider} />
      <Row>
        <Col md={12} lg={6}>
          <ProviderActionLogs provider={provider} />
          <ProviderDashboardChart provider={provider} />
        </Col>
        <Col md={12} lg={6}>
          <ProviderWidgets provider={provider} />
        </Col>
      </Row>
      <ProviderOfferingsComponent
        provider={provider}
        extraTableProps={{
          dropdownActions: null,
          title: translate('Offerings'),
        }}
      />
    </>
  );
};
